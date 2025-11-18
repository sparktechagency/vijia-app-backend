import { Request, Response, NextFunction } from 'express';
import { TransportServices } from './transport.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

const searchTransportFromAPis = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await TransportServices.searchTransportFromAPis();
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Transport fetched successfully',
        data: result,
    });
})


export const TransportController = {
    searchTransportFromAPis
};
