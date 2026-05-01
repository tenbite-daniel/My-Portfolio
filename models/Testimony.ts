import mongoose, { Schema, models } from 'mongoose'

const TestimonySchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  text: { type: String, required: true },
  avatar: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true })

delete (models as Record<string, unknown>).Testimony
export const Testimony = mongoose.model('Testimony', TestimonySchema)
