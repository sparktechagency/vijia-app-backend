import express from 'express';
import { ChatbotController } from './chatbot.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ChatbotValidations } from './chatbot.validation';

const router = express.Router();

router.post('/', auth(),validateRequest(ChatbotValidations.createChatbotSchema),ChatbotController.generateAiResponse); 

router.get('/', auth(),ChatbotController.getAiResponses);

export const ChatbotRoutes = router;
