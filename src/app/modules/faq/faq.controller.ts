import { Request, Response, NextFunction } from 'express';
import { FaqServices } from './faq.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

const getAllFaq = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const faq = await FaqServices.getAllFaqFromDB(req.query.type as string);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Faq retrieved successfully',
        data: faq,
    });
});


const createFaq = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const faq = await FaqServices.createFaqIntoDB(req.body);
    sendResponse(res, {
        success: true,
        statusCode: 201,
        message: 'Faq created successfully',
        data: faq,
    });
})

const updateFaq = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const faq = await FaqServices.updateFaqIntoDB(req.params.id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Faq updated successfully',
        data: faq,
    });
});

const deleteFaq = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const faq = await FaqServices.deleteFaqFromDB(req.params.id);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Faq deleted successfully',
        data: faq,
    });
});

export const FaqController = { 
    getAllFaq,
    createFaq,
    updateFaq,
    deleteFaq
    
};
