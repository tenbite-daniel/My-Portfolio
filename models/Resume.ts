import mongoose, { Schema, models } from 'mongoose'

const ResumeSchema = new Schema({
  experience: [{
    title: { type: String },
    period: { type: String },
    description: { type: String },
  }],
  education: [{
    title: { type: String },
    period: { type: String },
    description: { type: String },
  }],
  skills: [{
    name: { type: String },
    level: { type: Number },
  }],
}, { timestamps: true })

export const Resume = models.Resume || mongoose.model('Resume', ResumeSchema)
