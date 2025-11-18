import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { CategoryModel, ICategory, IUserType } from './category.interface';
import { Category, UserType } from './category.model';
import unlinkFile from '../../../shared/unlinkFile';

const createCategory = async (data: Partial<ICategory>): Promise<ICategory> => {
  const category = new Category(data);
  await category.save();
  return category;
};

const getAllCategories = async (): Promise<ICategory[]> => {
  const categories = await Category.find();
  return categories;
};

const deleteCategoryById = async (id: string): Promise<ICategory | null> => {
  const category = await Category.findByIdAndDelete(id);
  return category;
}

const createUserType = async (data: {name: string, icon: string}): Promise<IUserType> => {
    const userType = new UserType(data);
    await userType.save();
    return userType;
}

const getAllUserTypes = async (): Promise<IUserType[]> => {
    const userTypes = await UserType.find().lean().exec()
    return userTypes;
}

const deleteUserTypeById = async (id: string): Promise<IUserType | null> => {
    const userType = await UserType.findByIdAndDelete(id);
    return userType;
}

const updateUserTypeById = async (id: string, data: Partial<IUserType>): Promise<IUserType | null> => {
    const existingUserType = await UserType.findById(id);
    if (!existingUserType) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User type not found');
    }
    if(data.icon && existingUserType.icon){
        unlinkFile(existingUserType.icon);
    }
    const userType = await UserType.findByIdAndUpdate(id, data, { new: true });
    return userType;
}

export const CategoryServices = { createCategory, getAllCategories, deleteCategoryById, createUserType, getAllUserTypes, deleteUserTypeById, updateUserTypeById };
