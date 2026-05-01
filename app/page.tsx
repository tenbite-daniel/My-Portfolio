import { connectDB } from '@/lib/mongodb'
import { Profile } from '@/models/Profile'
import { About } from '@/models/About'
import { Testimony } from '@/models/Testimony'
import { Project } from '@/models/Project'
import { Resume } from '@/models/Resume'
import { CaseStudy } from '@/models/CaseStudy'
import { FeaturedRepo } from '@/models/FeaturedRepo'
import { profileData, aboutData, resumeData } from '@/lib/portfolio-data'
import { HomeClient } from '@/components/home-client'
import { GitHubSection } from '@/components/github-section'
import { fetchGitHubData, fetchFeaturedRepos } from '@/lib/github'
import { Suspense } from 'react'

export const revalidate = 3600

async function getProfile() {
  await connectDB()
  const doc = await Profile.findOne().lean()
  return doc ? JSON.parse(JSON.stringify(doc)) : null
}

async function getAbout() {
  await connectDB()
  const doc = await About.findOne().lean()
  return doc ? JSON.parse(JSON.stringify(doc)) : null
}

async function getTestimonials() {
  await connectDB()
  const docs = await Testimony.find({ status: 'approved' }).sort({ createdAt: -1 }).lean()
  return JSON.parse(JSON.stringify(docs))
}

async function getResume() {
  await connectDB()
  const doc = await Resume.findOne().lean() as Record<string, unknown> | null
  const plain = doc ? JSON.parse(JSON.stringify(doc)) : null
  return {
    experience: plain?.experience ?? resumeData.experience,
    education: plain?.education ?? resumeData.education,
    skills: plain?.skills ?? resumeData.skills,
    cvUrl: plain?.cvUrl ?? null,
  }
}

async function getProjects() {
  await connectDB()
  const docs = await Project.find().sort({ order: 1, createdAt: -1 }).lean()
  return JSON.parse(JSON.stringify(docs))
}

async function getGitHubData() {
  await connectDB()
  const [githubData, featuredRepoDocs] = await Promise.all([
    fetchGitHubData().catch(() => null),
    FeaturedRepo.find().sort({ order: 1 }).lean() as Promise<{ repoName: string }[]>,
  ])
  const featuredRepos = await fetchFeaturedRepos(featuredRepoDocs.map((d) => d.repoName))
  return { githubData, featuredRepos }
}

async function getCaseStudies() {
  await connectDB()
  const docs = await CaseStudy.find().sort({ order: 1 }).lean()
  return JSON.parse(JSON.stringify(docs))
}

export default async function Home() {
  const [profileDoc, aboutDoc, testimonials, projectDocs, resumeDoc, caseStudyDocs, { githubData, featuredRepos }] = await Promise.all([
    getProfile(),
    getAbout(),
    getTestimonials(),
    getProjects(),
    getResume(),
    getCaseStudies(),
    getGitHubData(),
  ])

  const profile = profileDoc
    ? {
        ...profileData,
        name: profileDoc.name ?? profileData.name,
        title: profileDoc.title ?? profileData.title,
        avatar: profileDoc.avatar ?? profileData.avatar,
        email: profileDoc.email ?? profileData.email,
        phone: profileDoc.phone ?? profileData.phone,
        location: profileDoc.location ?? profileData.location,
        social: {
          github: profileDoc.social?.github ?? profileData.social.github,
          linkedin: profileDoc.social?.linkedin ?? profileData.social.linkedin,
          instagram: profileDoc.social?.instagram ?? profileData.social.instagram,
          tiktok: profileDoc.social?.tiktok ?? profileData.social.tiktok,
        },
      }
    : profileData

  const description: string[] = aboutDoc?.description?.length
    ? aboutDoc.description
    : aboutData.description

  const services = aboutDoc?.services?.length
    ? aboutDoc.services.map(({ icon, title, description }: { icon: string; title: string; description: string }) => ({ icon, title, description }))
    : undefined
  const clients = aboutDoc?.clients?.length
    ? aboutDoc.clients.map(({ name, logo }: { name: string; logo: string }) => ({ name, logo }))
    : undefined
  const showClients: boolean = typeof aboutDoc?.showClients === 'boolean' ? aboutDoc.showClients : true
  const showMetrics: boolean = typeof aboutDoc?.showMetrics === 'boolean' ? aboutDoc.showMetrics : true
  const showBlog: boolean = typeof aboutDoc?.showBlog === 'boolean' ? aboutDoc.showBlog : true
  const showCaseStudies: boolean = typeof aboutDoc?.showCaseStudies === 'boolean' ? aboutDoc.showCaseStudies : true
  const showKeyOutcomes: boolean = typeof aboutDoc?.showKeyOutcomes === 'boolean' ? aboutDoc.showKeyOutcomes : true

  const projects = projectDocs?.length ? projectDocs : null
  const caseStudies = caseStudyDocs?.length ? caseStudyDocs : []

  return (
    <Suspense>
      <HomeClient profile={profile} aboutDescription={description} aboutServices={services} aboutClients={clients} aboutShowClients={showClients} showMetrics={showMetrics} showBlog={showBlog} showCaseStudies={showCaseStudies} showKeyOutcomes={showKeyOutcomes} initialProjects={projects} initialCaseStudies={caseStudies} testimonials={testimonials} resumeData={resumeDoc} githubSection={
        <GitHubSection githubData={githubData} featuredRepos={featuredRepos} />
      } />
    </Suspense>
  )
}
