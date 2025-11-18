import express from 'express';
import { FlightController } from './flight.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { FlightValidations } from './flight.validation';

const router = express.Router();

router.route("/offers")
    .post(auth(),validateRequest(FlightValidations.createFlightRequestZodSchema), FlightController.getFlightOffers)

router.route("/offers/realtime-offer")
    .post(auth(),validateRequest(FlightValidations.singleFlightofferZodValidationZodSchema), FlightController.getSingleFlightOffer)

router.route("/booking")
    .post(auth(),validateRequest(FlightValidations.FlightBookingRequestSchema), FlightController.createFlightBooking)
    .get(auth(),FlightController.getFlightOrderlist)
router.route("/booking/:id")
    .get(auth(),FlightController.getOrderDetails)
export const FlightRoutes = router;
