import { Request, Response, NextFunction } from 'express';
import { FavoriteServices } from './favorite.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

const createFavarite = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await FavoriteServices.createFavarite(req.body, req.user);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: result.message,
        data: result.success
    });
});

const getFavoriteList = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await FavoriteServices.getFavoriteList(req.user);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Favorite list fetched successfully",
        data: result.data,
        pagination: result.pagination
    });
});

export const FavoriteController = {
    createFavarite,
    getFavoriteList
 };
