import { error } from 'console';
import { z } from 'zod';
const createFlightRequestZodSchema = z.object({
  body: z.object({
    place: z.array(
      z.object({
        origin: z.string({ error: 'Origin is required' }),
        destination: z.string({ error: 'Destination is required' }),
        departureDate: z.string({
          error: 'Departure Date is required',
        }),
        returnDate: z.string().optional(),
      })
    ),
    adults: z.number({ error: 'Adults is required' }),
    children: z.number({ error: 'Children is required' }),
    class: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'], {
      error: 'Class is required',
    }),
    limit: z.number({ error: 'Limit is required' }).optional(),
    minPrice: z.number({ error: 'Min Price is required' }).optional(),
    maxPrice: z.number({ error: 'Max Price is required' }).optional(),
    shedule: z.string({ error: 'Shedule is required' })?.refine((value:string)=>!value || (
      (value.includes('AM') || value.includes('PM')) && (value.includes('-'))
    ),'Invalid shedule').optional(),
  }),
});

const singleFlightofferZodValidationZodSchema = z.object({
  body: z.object({
    offer: z.any(),
  }),
});

export const PassportSchema = z.object({
  birthPlace: z.string(),
  issuanceLocation: z.string(),
  issuanceDate: z.string(),
  number: z.string(),
  expiryDate: z.string(),
  issuanceCountry: z.string(),
  validityCountry: z.string(),
  nationality: z.string(),
});

export const UserInfoSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  email: z.string().email(),
  phone: z.string(),
  dob: z.string(),
  nationality: z.string(),
  gender: z.string(),
  recentFlayerNumber: z.string(),
  passport: PassportSchema,
});

export const FlightBookingRequestSchema = z.object({
  body: z.object({
    userInfos: z.array(UserInfoSchema),
    offerPrice: z.any(),
  }),
});

export const FlightValidations = {
  createFlightRequestZodSchema,
  singleFlightofferZodValidationZodSchema,
  FlightBookingRequestSchema,
};
