import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description?: string;
  quantity: number;
  price: number;
  category: string;
  image?: string; // Store image path as string
}

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0.01
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

export const Product = mongoose.model<IProduct>('Product', productSchema); 