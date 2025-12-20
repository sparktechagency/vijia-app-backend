import { z } from "zod";

const createDisclaimerZodSchema = z.object({
    body: z.object({
        content: z.string({
            error: 'Content is required'
        }),
        type: z.enum(['terms', 'privacy', 'about'], {
            error: 'Type is required'
        })
    })
})


export const DisclaimerValidation = {
    createDisclaimerZodSchema
}