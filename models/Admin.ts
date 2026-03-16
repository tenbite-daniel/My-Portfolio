import mongoose, { Schema, models } from 'mongoose'

const AdminSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true })

export const Admin = models.Admin || mongoose.model('Admin', AdminSchema)
