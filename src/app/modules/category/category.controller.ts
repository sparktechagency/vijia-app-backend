import { Request, Response, NextFunction } from 'express';
import { CategoryServices } from './category.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { getSingleFilePath } from '../../../shared/getFilePath';

const createCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const category = await CategoryServices.createCategory(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Category created successfully',
    data: category,
  });
});

const getAllCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const categories = await CategoryServices.getAllCategories();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Categories retrieved successfully',
    data: categories,
  });
});

const deleteCategoryById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const category = await CategoryServices.deleteCategoryById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Category deleted successfully',
    data: category,
  });
});

const getAllUserTypes = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userTypes = await CategoryServices.getAllUserTypes();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User types retrieved successfully',
    data: userTypes,
  });
});

const updateCategoryById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const category = await CategoryServices.updateUserTypeById(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Category updated successfully',
    data: category,
  });
});

const deleteUserTypeById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userType = await CategoryServices.deleteUserTypeById(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User type deleted successfully',
    data: userType,
  });
});

const createUserType = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
const icon = getSingleFilePath(req.files, 'image');
  const userType = await CategoryServices.createUserType({name: req.body.name, icon: icon!});
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'User type created successfully',
    data: userType,
  });
});

export const CategoryController = { createCategory, getAllCategories, deleteCategoryById, getAllUserTypes, updateCategoryById, deleteUserTypeById, createUserType };
