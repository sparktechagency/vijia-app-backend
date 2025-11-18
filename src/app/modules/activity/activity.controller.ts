import { Request, Response, NextFunction } from 'express';
import { ActivityServices } from './activity.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { getMultipleFilesPath } from '../../../shared/getFilePath';
import { kafkaProducer } from '../../../tools/kafka/kafka-producers/kafka.producer';
import { googleHelper } from '../../../helpers/googleMapHelper';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const getActivities = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const activities = await ActivityServices.getActivities(req.query);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Activities retrieved successfully',
        data: activities.data,
        pagination: activities.pagination
    });
});

const createActivity = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const images = getMultipleFilesPath(req.files,"image");
    const latlong = await googleHelper.getLatLongFromAddress(req.body.address!)
    if(!latlong.lat || !latlong.lng){
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid address');
    }

    const activity = req.body;
    activity.images = images;
    activity.user = req.user.id
    await kafkaProducer.sendMessage('create-activity', activity);
    sendResponse(res, {
        success: true,
        statusCode: 201,
        message: 'Activity created successfully',
        data: activity,
    });
});


const deleteActivity = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const activity = await ActivityServices.deleteActivityFromDB(req.params.id);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Activity deleted successfully',
        data: activity,
    });
});


const updateActivity = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const images = getMultipleFilesPath(req.files,"image");
    if(images){
        req.body.images = images;
    }
    const activity = await ActivityServices.updateActivityIntoDB(req.params.id,req.body);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Activity updated successfully',
        data: activity,
    });
});


const travelDestinations = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const activities = await ActivityServices.getPopulerDestinations(req.query,req.user);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Activities retrieved successfully',
        data: activities.data,
        pagination: activities.pagination
    });
});

export const ActivityController = {
    getActivities,
    createActivity,
    deleteActivity,
    updateActivity,
    travelDestinations
};
