import { Schema, model } from 'mongoose';
import { IFavorite, FavoriteModel } from './favorite.interface'; 

const favoriteSchema = new Schema<IFavorite, FavoriteModel>({
  refId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  data: {
    type: Schema.Types.Mixed,
    required: true,
  },
});

favoriteSchema.index({ refId: 1 }, { unique: true });

export const Favorite = model<IFavorite, FavoriteModel>('Favorite', favoriteSchema);
