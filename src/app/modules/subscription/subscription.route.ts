import express from 'express';
import { SubscriptionController } from './subscription.controller';
import validateRequest from '../../middlewares/validateRequest';
import { SubscriptionValidation } from './subscription.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
const router = express.Router();

router.route("/")
.post(
  validateRequest(SubscriptionValidation.createSubsciptionZodSchema),
  SubscriptionController.createSubsciption
).get(
  auth(),
  SubscriptionController.getSubscription
)

router.route("/demo")
.post(
  validateRequest(SubscriptionValidation.createSubsciptionZodSchema),
  SubscriptionController.demoSubscription
)

router.route("/subscribers")
.get(
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  SubscriptionController.getSubscribers
)
export const SubscriptionRoutes = router;