import { NextFunction, raw, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import ApiError from '../../../errors/ApiError';

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...userData } = req.body;
    const result = await UserService.createUserToDB(userData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User created successfully',
      data: result,
    });
  }
);

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let image = getSingleFilePath(req.files, 'image');

    const data = {
      image,
      ...req.body,
    };
    const result = await UserService.updateProfileToDB(user, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);


const deleteAccount = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    
    const result = await UserService.deleteAccountFromDB(user, req.body.password);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Account deleted successfully',
      data: result,
    });
  }
);

const userList = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getUserListFromDB(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User list fetched successfully',
    data: result.data,
    pagination:result.pagination
  });
});

const changeStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if(!req.body.status){throw new ApiError(StatusCodes.BAD_REQUEST, 'Please provide status');}

  const result = await UserService.changeStatusOFUser(id, req.body.status);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User status changed successfully',
    data: result,
  });
});

export const UserController = { createUser, getUserProfile, updateProfile, deleteAccount, userList, changeStatus };
