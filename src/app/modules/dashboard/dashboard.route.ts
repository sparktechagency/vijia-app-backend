import express from 'express';
import { DashboardController } from './dashboard.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.get('/summury',auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),DashboardController.getAnalytics); 
router.get('/booking',auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),DashboardController.getAllBookings);
export const DashboardRoutes = router;
