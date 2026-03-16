import mongoose, { Schema, models } from 'mongoose'

const SiteSettingsSchema = new Schema({
  seoTitle: { type: String },
  seoDescription: { type: String },
  seoKeywords: { type: String },
  ogImage: { type: String },
}, { timestamps: true })

export const SiteSettings = models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema)
