'use client'

import { useEffect, useRef, useState } from 'react'

export function SkillsSection() {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const skills = {
    frontend: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'HTML/CSS', 'JavaScript'],
    backend: ['Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'REST APIs', 'GraphQL'],
    tools: ['Git', 'Docker', 'AWS', 'Vercel', 'CI/CD', 'Testing'],
  }

  const labels: Record<string, string> = {
    frontend: 'Frontend Development',
    backend: 'Backend Development',
    tools: 'Tools & Technologies',
  }

  return (
    <section ref={ref} className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <h2 className="mb-16 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Technical Skills
        </h2>
        <div className="grid gap-12 md:grid-cols-3">
          {(Object.entries(skills) as [string, string[]][]).map(([category, items], colIdx) => (
            <div key={category}>
              <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {labels[category]}
              </h3>
              <ul className="space-y-3">
                {items.map((skill, i) => (
                  <li
                    key={skill}
                    className="text-base text-foreground md:text-lg transition-[opacity,transform] duration-700"
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? 'translateY(0)' : 'translateY(6px)',
                      transitionDelay: `${(colIdx * items.length + i) * 30}ms`,
                      transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
                    }}
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
