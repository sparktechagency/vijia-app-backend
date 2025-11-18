import express from 'express';
import { ActivityController } from './activity.controller';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { ActivityValidations } from './activity.validation';

const router = express.Router();

router.route("/")
    .get(auth(),ActivityController.getActivities)
    .post(auth(),fileUploadHandler(),validateRequest(ActivityValidations.createActivitySchema),ActivityController.createActivity)

router.route("/populer-destinations")
    .get(auth(),ActivityController.travelDestinations)

router.route("/:id")
    .delete(auth(),ActivityController.deleteActivity)
    .patch(auth(),fileUploadHandler(),validateRequest(ActivityValidations.createActivitySchema.partial()),ActivityController.updateActivity)

export const ActivityRoutes = router;
