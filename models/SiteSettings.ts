import mongoose, { Schema, models } from 'mongoose'

const SiteSettingsSchema = new Schema({
  seoTitle: { type: String },
  seoDescription: { type: String },
  seoKeywords: { type: String },
  ogImage: { type: String },
  defaultOgImage: { type: String },
  favicon: { type: String },
  siteName: { type: String },
  googleAnalyticsId: { type: String },
  maintenanceMode: { type: Boolean, default: false },
  maintenanceDuration: { type: Number, default: 1 },
  maintenanceDurationType: { type: String, default: 'hours' },
  maintenanceEndsAt: { type: Date, default: null },
  twitterCard: { type: String, default: 'summary_large_image' },
  twitterSite: { type: String },
  twitterCreator: { type: String },
  canonicalUrl: { type: String },
}, { timestamps: true })

// Delete cached model to ensure schema changes are picked up
delete (mongoose as any).models.SiteSettings

export const SiteSettings = mongoose.model('SiteSettings', SiteSettingsSchema)
