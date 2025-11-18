import { Schema, model } from 'mongoose';
import { ICategory, CategoryModel, IUserType, UserTypeModel } from './category.interface'; 

const categorySchema = new Schema<ICategory, CategoryModel>({
  name: {
    type: String,
    required: true,
  },
});

const userTypeSchema = new Schema<IUserType, UserTypeModel>({
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
});

export const Category = model<ICategory, CategoryModel>('Category', categorySchema);
export const UserType = model<IUserType, UserTypeModel>('UserType', userTypeSchema);