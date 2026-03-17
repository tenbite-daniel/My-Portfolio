import { connectDB } from '@/lib/mongodb'
import { Profile } from '@/models/Profile'
import { About } from '@/models/About'
import { Testimony } from '@/models/Testimony'
import { profileData, aboutData } from '@/lib/portfolio-data'
import { HomeClient } from '@/components/home-client'
import { cacheTag } from 'next/cache'

async function getProfile() {
  'use cache'
  cacheTag('profile')
  await connectDB()
  return Profile.findOne().lean() as any
}

async function getAbout() {
  'use cache'
  cacheTag('about')
  await connectDB()
  return About.findOne().lean() as any
}

async function getTestimonials() {
  'use cache'
  cacheTag('testimonials')
  await connectDB()
  return Testimony.find({ status: 'approved' }).sort({ createdAt: -1 }).lean()
}

export default async function Home() {
  const [profileDoc, aboutDoc, testimonials] = await Promise.all([
    getProfile(),
    getAbout(),
    getTestimonials(),
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

  return <HomeClient profile={profile} aboutDescription={description} aboutServices={services} aboutClients={clients} aboutShowClients={showClients} testimonials={testimonials} />
}
