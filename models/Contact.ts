import mongoose, { Schema, models } from 'mongoose'

const ReplySchema = new Schema({
  subject: { type: String, required: true },
  body: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
})

const ContactSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  replies: [ReplySchema],
}, { timestamps: true })

delete (models as Record<string, unknown>).Contact
export const Contact = mongoose.model('Contact', ContactSchema)
