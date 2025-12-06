import { Request, Response, NextFunction } from 'express';
import { ChatbotServices } from './chatbot.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { getSingleFilePath } from '../../../shared/getFilePath';

const generateAiResponse = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const audio = getSingleFilePath(req.files,"media")
    const result = await ChatbotServices.generateAiResponse(req.user,req.body?.prompt,audio);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message:'Ai response generated successfully',
        data: result
    });
})

const getAiResponses = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await ChatbotServices.getMessagesOFChatbot(req.user,req.query);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message:'Ai responses fetched successfully',
        data: result.data,
        pagination: result.pagination
    });
})
export const ChatbotController = {
    generateAiResponse,
    getAiResponses
};
