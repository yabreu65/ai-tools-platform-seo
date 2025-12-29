
import mongoose from 'mongoose'

const userSettingsSchema = new mongoose.Schema({
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  language: { type: String, enum: ['es', 'en'], default: 'es' },
  notifications: {
    email: { type: Boolean, default: true },
    browser: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false }
  },
  privacy: {
    profilePublic: { type: Boolean, default: false },
    shareAnalytics: { type: Boolean, default: true }
  }
}, { _id: false })

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  avatar: { type: String },
  plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  emailVerified: { type: Boolean, default: false },
  settings: { type: userSettingsSchema, default: () => ({}) },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Middleware para actualizar updatedAt
userSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.User || mongoose.model('User', userSchema)
