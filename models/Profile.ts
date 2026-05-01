import mongoose, { Schema, models } from 'mongoose'

const ProfileSchema = new Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  avatar: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  birthday: { type: String },
  location: { type: String },
  social: {
    github: { type: String },
    linkedin: { type: String },
    instagram: { type: String },
    tiktok: { type: String },
  },
}, { timestamps: true })

export const Profile = models.Profile || mongoose.model('Profile', ProfileSchema)
