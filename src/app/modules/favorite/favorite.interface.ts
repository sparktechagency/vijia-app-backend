import { Model, Types } from 'mongoose';

export type IFavorite = {
  refId: string;
  type: string;
  name: string;
  image ?: string;
  user: Types.ObjectId;
  data: any;
};

export type FavoriteModel = Model<IFavorite>;
