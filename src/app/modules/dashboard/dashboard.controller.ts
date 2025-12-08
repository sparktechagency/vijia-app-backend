import { Request, Response, NextFunction } from 'express';
import { DashboardServices } from './dashboard.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
const getAnalytics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await DashboardServices.getAnalytics(req.query);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Analytics fetched successfully',
        data: result,
    });
})

const getAllBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await DashboardServices.getAllBookingsFromDb(req.query);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Bookings fetched successfully',
        data: {
            summury:result.summury,
            bookings:result.data
        },
        pagination: result.pagination
    });
})
export const DashboardController = {
    getAnalytics,
    getAllBookings
};


