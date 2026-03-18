import mongoose, { Schema, models } from 'mongoose'

const FeaturedRepoSchema = new Schema({
  repoName: { type: String, required: true },
  order: { type: Number, default: 0 },
}, { timestamps: true })

export const FeaturedRepo = models.FeaturedRepo || mongoose.model('FeaturedRepo', FeaturedRepoSchema)
