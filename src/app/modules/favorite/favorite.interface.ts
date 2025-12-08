import { Model, Types } from 'mongoose';

export type IFavorite = {
  referenceId: string;
  type: string;
  name: string;
  image ?: string;
  user: Types.ObjectId;
  data: any;
};

export type FavoriteModel = Model<IFavorite> & {
  isExistFavorite(refId: string,user: string): Promise<IFavorite | null>;
}
