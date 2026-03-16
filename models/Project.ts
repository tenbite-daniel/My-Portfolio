import mongoose, { Schema, models } from 'mongoose'

const ProjectSchema = new Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String },
  description: { type: String },
  tech: [{ type: String }],
  liveUrl: { type: String },
  githubUrl: { type: String },
  metrics: { type: Map, of: String },
  order: { type: Number, default: 0 },
}, { timestamps: true })

export const Project = models.Project || mongoose.model('Project', ProjectSchema)
