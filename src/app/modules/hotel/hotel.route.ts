import express from 'express';
import { HotelController } from './hotel.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { HotelValidation } from './hotel.validation';

const router = express.Router();

router.route("/home/hotel-list")
    .get(auth(),HotelController.getHotelList)

router.route("/home/activity-list")
    .get(auth(),HotelController.getActiviesForHome)

router.route("/home/details/:id")
    .get(auth(),HotelController.getSingleDetails)

router.route("/search")
    .post(auth(),HotelController.searchHotelsByLocation)

router.route("/booking")
    .post(auth(),validateRequest(HotelValidation.createBookHotelZodSchema), HotelController.bookHotel)
    .get(auth(),HotelController.getAllBookings)

router.route("/discover")
    .get(auth(),validateRequest(HotelValidation.getDiscoverPlacesZodSchema),HotelController.discoverPlaces)
export const HotelRoutes = router;