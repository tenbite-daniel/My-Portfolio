import mongoose, { Schema, models } from 'mongoose'

const CaseStudySchema = new Schema({
  title: { type: String, required: true },
  project: { type: String },
  overview: { type: String },
  challenge: { type: String },
  approach: { type: String },
  solution: { type: String },
  results: [{ type: String }],
  order: { type: Number, default: 0 },
}, { timestamps: true })

delete (models as Record<string, unknown>).CaseStudy
export const CaseStudy = mongoose.model('CaseStudy', CaseStudySchema)
