import mongoose, { Schema, models } from 'mongoose'

const TestimonySchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  text: { type: String, required: true },
  avatar: { type: String },
  approved: { type: Boolean, default: false },
}, { timestamps: true })

export const Testimony = models.Testimony || mongoose.model('Testimony', TestimonySchema)
