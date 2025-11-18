import { z } from 'zod';
const createFlightRequestZodSchema = z.object({
  body: z.object({
    place: z.array(
      z.object({
        origin: z.string({ required_error: 'Origin is required' }),
        destination: z.string({ required_error: 'Destination is required' }),
        departureDate: z.string({
          required_error: 'Departure Date is required',
        }),
        returnDate: z.string().optional(),
      })
    ),
    adults: z.number({ required_error: 'Adults is required' }),
    children: z.number({ required_error: 'Children is required' }),
    class: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'], {
      required_error: 'Class is required',
    }),
    limit: z.number({ required_error: 'Limit is required' }).optional(),
    minPrice: z.number({ required_error: 'Min Price is required' }).optional(),
    maxPrice: z.number({ required_error: 'Max Price is required' }).optional(),
    shedule: z.string({ required_error: 'Shedule is required' })?.refine((value:string)=>!value || (
      (value.includes('AM') || value.includes('PM')) && (value.includes('-'))
    ),'Invalid shedule').optional(),
  }),
});

const singleFlightofferZodValidationZodSchema = z.object({
  body: z.object({
    offer: z.any({ required_error: 'Offer is required' }),
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
