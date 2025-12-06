import { Request, Response, NextFunction } from 'express';
import { RestrudentServices } from './restrudent.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

const getAllRestrudents = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const restrudents = await RestrudentServices.getRestrudentUsingGeoCode(req.query);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Restrudents retrieved successfully',
        data: restrudents,
    });
})

const getSingleRestrudent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const restrudent = await RestrudentServices.getSingleRestrudent(req.params.id);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Restrudent retrieved successfully',
        data: restrudent,
    });
})

export const RestrudentController = {
    getAllRestrudents,
    getSingleRestrudent
};
