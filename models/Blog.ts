import mongoose, { Schema, models } from 'mongoose'

const BlogSchema = new Schema({
  title: { type: String, required: true },
  category: { type: String },
  date: { type: String },
  readTime: { type: String },
  image: { type: String },
  excerpt: { type: String },
  content: { type: String },
  tags: [{ type: String }],
  slug: { type: String, required: true, unique: true },
  published: { type: Boolean, default: false },
}, { timestamps: true })

export const Blog = models.Blog || mongoose.model('Blog', BlogSchema)
