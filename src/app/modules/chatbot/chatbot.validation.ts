import { z } from 'zod';
const createChatbotSchema = z.object({
    body: z.object({
        prompt: z.string({ error: 'prompt is required' }).optional(),
    })
})
export const ChatbotValidations = {
    createChatbotSchema
};
