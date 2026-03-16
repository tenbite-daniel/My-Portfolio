'use client'

import { FileText, Github, Linkedin, Download, MessageCircle, Send } from 'lucide-react'
import { useState } from 'react'

export function HeroSection() {
  const [showResume, setShowResume] = useState(false)

  const handleDownloadPDF = () => {
    const pdfUrl = 'https://example.com/resume.pdf'
    window.open(pdfUrl, '_blank')
  }

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-accent/5" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />

      <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32 lg:px-8">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full mb-6">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-xs md:text-sm font-medium text-accent">Available for opportunities</span>
          </div>

          {/* Main Heading */}
          <h1 className="mb-4 text-6xl font-bold tracking-tight text-foreground md:text-7xl lg:text-8xl text-balance">
            Alex Morgan
          </h1>

          {/* Subheading */}
          <p className="mb-4 text-2xl md:text-3xl font-semibold bg-gradient-to-r from-accent via-accent to-accent/70 bg-clip-text text-transparent">
            Full-Stack Web Developer
          </p>

          {/* Description */}
          <p className="text-pretty text-base leading-relaxed text-muted-foreground md:text-lg mb-8 max-w-2xl">
            Crafting exceptional web experiences with modern technologies. I specialize in building scalable, performant applications that solve real problems and deliver measurable impact.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-12">
            <button
              onClick={() => setShowResume(true)}
              className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-accent text-accent-foreground rounded-lg hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 transition-all font-medium text-sm md:text-base"
            >
              <FileText className="w-5 h-5" />
              Preview Resume
            </button>
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-secondary border border-border text-foreground rounded-lg hover:border-accent hover:bg-secondary/80 transition-all font-medium text-sm md:text-base"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <span className="text-xs md:text-sm font-medium text-muted-foreground">Follow me:</span>
            <div className="flex gap-2">
              <a
                href="https://github.com/tenbite-daniel"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-secondary hover:bg-accent hover:text-accent-foreground transition-all flex items-center justify-center"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-secondary hover:bg-accent hover:text-accent-foreground transition-all flex items-center justify-center"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-secondary hover:bg-accent hover:text-accent-foreground transition-all flex items-center justify-center"
                aria-label="TikTok"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.68v13.67a2.4 2.4 0 0 1-2.4 2.4 2.4 2.4 0 0 1-2.4-2.4 2.4 2.4 0 0 1 2.4-2.4c.37 0 .74.05 1.1.15V9.5a5.994 5.994 0 0 0-1.1-.1A6 6 0 0 0 5 15.5a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-7.15a7.994 7.994 0 0 0 4.59 1.45v-3.68a4.993 4.993 0 0 1-.59-.05z" />
                </svg>
              </a>
              <a
                href="https://wa.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-secondary hover:bg-accent hover:text-accent-foreground transition-all flex items-center justify-center"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-secondary hover:bg-accent hover:text-accent-foreground transition-all flex items-center justify-center"
                aria-label="Telegram"
              >
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

        {/* Resume Modal */}
        {showResume && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl md:rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
              <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
                <h2 className="text-2xl font-bold text-foreground">Resume</h2>
                <button
                  onClick={() => setShowResume(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-6 text-foreground text-sm md:text-base">
                <div>
                  <h3 className="text-lg font-bold mb-2">Alex Morgan</h3>
                  <p className="text-muted-foreground">Full-Stack Web Developer</p>
                  <p className="text-muted-foreground text-xs md:text-sm">San Francisco, CA | alex@example.com | +1 (234) 567-890</p>
                </div>

                <div>
                  <h4 className="font-bold text-accent mb-2">Professional Summary</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Experienced Full-Stack Web Developer with 5+ years of expertise in building scalable, high-performance web applications.
                    Skilled in modern JavaScript frameworks, backend architecture, and cloud technologies. Strong track record of delivering projects
                    that significantly improve user experience and business outcomes.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-accent mb-2">Experience</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold">Senior Full-Stack Developer</p>
                      <p className="text-muted-foreground text-xs">Tech Company Inc. | 2022 - Present</p>
                      <p className="text-muted-foreground text-sm mt-1">Led development of e-commerce platform processing $2M+ in transactions</p>
                    </div>
                    <div>
                      <p className="font-semibold">Full-Stack Developer</p>
                      <p className="text-muted-foreground text-xs">Digital Agency | 2020 - 2022</p>
                      <p className="text-muted-foreground text-sm mt-1">Built 10+ client projects with React, Node.js, and PostgreSQL</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-accent mb-2">Education</h4>
                  <p className="font-semibold">Bachelor of Science in Computer Science</p>
                  <p className="text-muted-foreground text-xs">University of Technology | 2019</p>
                </div>

                <div>
                  <h4 className="font-bold text-accent mb-2">Core Skills</h4>
                  <p className="text-muted-foreground">
                    React, Next.js, TypeScript, Node.js, Express, PostgreSQL, MongoDB, AWS, Docker, GraphQL, REST APIs, Tailwind CSS, Git
                  </p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border">
                  <a
                    href="#"
                    download
                    className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm text-center"
                  >
                    Download PDF
                  </a>
                  <button
                    onClick={() => setShowResume(false)}
                    className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
