'use client'

import { Calendar, Clock, ArrowRight, ArrowLeft } from 'lucide-react'
import { blogData } from '@/lib/portfolio-data'
import { useState } from 'react'

export function BlogSection() {
  const { posts } = blogData
  const [selectedPost, setSelectedPost] = useState<number | null>(null)
  
  if (selectedPost !== null && posts[selectedPost]) {
    const post = posts[selectedPost]
    return (
      <article className="space-y-8">
        {/* Back Button */}
        <button
          onClick={() => setSelectedPost(null)}
          className="inline-flex items-center gap-2 text-accent hover:gap-3 transition-all font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </button>

        {/* Featured Image */}
        <div className="relative w-full h-96 rounded-xl md:rounded-2xl overflow-hidden">
          <img
            src={post.image || '/placeholder.svg'}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
            {post.category}
          </div>
        </div>

        {/* Article Header */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readTime}</span>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-invert max-w-none space-y-6">
          <p className="text-lg leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>

          <div className="bg-secondary rounded-lg p-6 border border-border">
            <p className="text-muted-foreground leading-relaxed">
              {post.content || 'Full article content would be displayed here. This is a comprehensive breakdown of the topic with detailed explanations, code examples, and best practices.'}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 pt-8 border-t border-border">
          <button
            onClick={() => {
              const prevIdx = selectedPost > 0 ? selectedPost - 1 : posts.length - 1
              setSelectedPost(prevIdx)
            }}
            className="flex-1 px-6 py-3 bg-secondary border border-border rounded-lg hover:border-accent transition-all font-medium text-sm"
          >
            Previous Article
          </button>
          <button
            onClick={() => setSelectedPost(null)}
            className="flex-1 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:shadow-lg transition-all font-medium text-sm"
          >
            Back to List
          </button>
          <button
            onClick={() => {
              const nextIdx = selectedPost < posts.length - 1 ? selectedPost + 1 : 0
              setSelectedPost(nextIdx)
            }}
            className="flex-1 px-6 py-3 bg-secondary border border-border rounded-lg hover:border-accent transition-all font-medium text-sm"
          >
            Next Article
          </button>
        </div>
      </article>
    )
  }

  return (
    <section className="space-y-8 md:space-y-12">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Blog & Articles</h2>
        <div className="w-10 h-1 bg-accent rounded-full mb-6" />
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
          Insights and knowledge sharing on web development, architecture, design, and best practices. Updated regularly with new articles and tutorials.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post, index) => (
          <article
            key={index}
            className="group h-full bg-secondary rounded-xl md:rounded-2xl border border-border overflow-hidden hover:border-accent transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 flex flex-col"
          >
            {/* Image */}
            <div className="relative h-48 md:h-56 overflow-hidden bg-background">
              <img
                src={post.image || '/placeholder.svg'}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {/* Category Badge */}
              <div className="absolute top-4 right-4 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                {post.category}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 md:p-6 flex-1 flex flex-col">
              <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-2">
                {post.title}
              </h3>

              <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">
                {post.excerpt}
              </p>

              {/* Meta Info */}
              <div className="flex items-center gap-4 mb-4 text-xs md:text-sm text-muted-foreground pb-4 border-b border-border">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full hover:bg-accent/20 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Read More Button */}
              <button
                onClick={() => setSelectedPost(index)}
                className="inline-flex items-center gap-2 mt-auto text-sm font-medium text-accent hover:gap-3 transition-all"
              >
                Read Article
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        ))}
      </div>


    </section>
  )
}
