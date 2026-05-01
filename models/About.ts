import mongoose, { Schema, models } from 'mongoose'

const AboutSchema = new Schema({
  description: [{ type: String }],
  services: [{
    icon: { type: String },
    title: { type: String },
    description: { type: String },
  }],
  clients: [{
    name: { type: String },
    logo: { type: String },
  }],
  showClients: { type: Boolean, default: true },
  showMetrics: { type: Boolean, default: true },
  showBlog: { type: Boolean, default: true },
  showCaseStudies: { type: Boolean, default: true },
  showKeyOutcomes: { type: Boolean, default: true },
  keyOutcomes: [{
    value: { type: String },
    label: { type: String },
  }],
}, { timestamps: true })

delete (models as Record<string, unknown>).About
export const About = mongoose.model('About', AboutSchema)
