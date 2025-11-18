import { Schema, model } from 'mongoose';
import { HomeItemModel, IHomeItem, IPreference, PreferenceModel } from './preference.interface'; 

const preferenceSchema = new Schema<IPreference, PreferenceModel>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  city: {
    type: String,
  },
  country: {
    type: String,
  },
  hotels: {
    type: [Object],
  },
  flights: {
    type: [Object],
  },
  activities: {
    type: [Object],
  },

  aiPreferences: {
    type: [Object],
  },
});


const homeItemSchema = new Schema<IHomeItem, HomeItemModel>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: false,
  },
  referenceId: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  images: {
    type: [String],
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  bookingLink: {
    type: String,
    required: false,
  },
  startDate: {
    type: String,
    required: false,
  },
  endDate: {
    type: String,
    required: false,
  },
  country: {
    type: String,
    required: false,
  },
  city: {
    type: String,
    required: false,
  },
  lat: {
    type: Number,
    required: false,
  },
  lng: {
    type: Number,
    required: false,
  },
  price: {
    type: Number,
    required: false,
  },
  currency: {
    type: String,
    required: false,
  },
  isDiscounted: {
    type: Boolean,
    required: false,
  },
  discountPercentage: {
    type: Number,
    required: false,
  },
  discountAmount: {
    type: Number,
    required: false,
  },
  tags: {
    type: [String],
    required: false,
  },
  priceGiving: {
    type: Boolean,
    required: false,
    default: false
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: false
    },
    coordinates: {
      type: [Number],
      required: false
    }
  }
},{
  timestamps: true});
export const Preference = model<IPreference, PreferenceModel>('Preference', preferenceSchema);
export const HomeItem = model<IHomeItem, HomeItemModel>('HomeItem', homeItemSchema);
