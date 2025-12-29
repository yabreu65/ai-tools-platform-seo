import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  // Plan fields
  plan: 'free' | 'premium' | 'trial';
  planStartDate?: Date;
  planEndDate?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  // Usage limits
  monthlyAnalysisCount: number;
  monthlyExportCount: number;
  monthlySaveCount: number;
  // Reset dates for usage tracking
  usageResetDate: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  // Plan fields
  plan: {
    type: String,
    enum: ['free', 'premium', 'trial'],
    default: 'free'
  },
  planStartDate: {
    type: Date
  },
  planEndDate: {
    type: Date
  },
  stripeCustomerId: {
    type: String
  },
  stripeSubscriptionId: {
    type: String
  },
  // Usage limits
  monthlyAnalysisCount: {
    type: Number,
    default: 0
  },
  monthlyExportCount: {
    type: Number,
    default: 0
  },
  monthlySaveCount: {
    type: Number,
    default: 0
  },
  // Reset dates for usage tracking
  usageResetDate: {
    type: Date,
    default: () => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 1); // First day of next month
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);