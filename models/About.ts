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
}, { timestamps: true })

export const About = models.About || mongoose.model('About', AboutSchema)
