import mongoose, { Document, Schema } from 'mongoose';

export interface IPlan extends Document {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    monthlyAnalysis: number;
    monthlyExports: number;
    monthlySaves: number;
  };
  popular: boolean;
  active: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const planSchema = new Schema<IPlan>({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  interval: {
    type: String,
    enum: ['month', 'year'],
    default: 'month'
  },
  features: [{
    type: String,
    required: true
  }],
  limits: {
    monthlyAnalysis: {
      type: Number,
      required: true,
      min: 0
    },
    monthlyExports: {
      type: Number,
      required: true,
      min: 0
    },
    monthlySaves: {
      type: Number,
      required: true,
      min: 0
    }
  },
  popular: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  stripeProductId: {
    type: String
  },
  stripePriceId: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model<IPlan>('Plan', planSchema);