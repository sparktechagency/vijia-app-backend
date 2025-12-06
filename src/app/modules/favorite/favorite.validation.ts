import { z } from 'zod';
const createFavoriteZodSchema = z.object({
  body: z.object({
    referenceId: z.string({ required_error: 'Ref ID is required' }),
    type: z.string({ required_error: 'Type is required' }),
    data: z.any({ required_error: 'Data is required' }),
  }),
})
export const FavoriteValidations = {
  createFavoriteZodSchema
};
