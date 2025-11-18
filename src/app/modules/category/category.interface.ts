import { Model } from 'mongoose';

export type ICategory = {
  name: string;
};

export type IUserType = {
  name: string;
  icon: string;
}

export type CategoryModel = Model<ICategory>;
export type UserTypeModel = Model<IUserType>;