import mongoose, { Schema, models } from 'mongoose'

const TestimonySchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  text: { type: String, required: true },
  avatar: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true })

// Delete cached model to ensure schema changes (status field) take effect
if (models.Testimony) delete mongoose.connection.models['Testimony']
export const Testimony = mongoose.model('Testimony', TestimonySchema)
