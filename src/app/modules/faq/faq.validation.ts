
import { z } from 'zod';


const createFaqZodSchema = z.object({
    body: z.object({
        question: z.string({ error: 'Question is required' }),
        answer: z.string({ error: 'Answer is required' }),
        type: z.enum(['overview', 'flight', 'hotel'], { error: 'Type is required' }),
    }),
});

const updateFaqZodSchema = z.object({
    body: z.object({
        question: z.string().optional(),
        answer: z.string().optional(),
        type: z.enum(['overview', 'flight', 'hotel']).optional(),
    }),
});

const getFaqZodSchema = z.object({
    query: z.object({
        type: z.enum(['overview', 'flight', 'hotel']).optional(),
    })
})
export const FaqValidations = { 
    createFaqZodSchema,
    updateFaqZodSchema,
    getFaqZodSchema
 };
