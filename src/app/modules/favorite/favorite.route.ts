import express from 'express';
import { FavoriteController } from './favorite.controller';
import validateRequest from '../../middlewares/validateRequest';
import { FavoriteValidations } from './favorite.validation';
import auth from '../../middlewares/auth';

const router = express.Router();

router.route("/")
    .post(auth(),validateRequest(FavoriteValidations.createFavoriteZodSchema), FavoriteController.createFavarite)
    .get(auth(),FavoriteController.getFavoriteList)

export const FavoriteRoutes = router;
