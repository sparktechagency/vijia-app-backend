import express from 'express';
import { RestrudentController } from './restrudent.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.get('/',auth(),RestrudentController.getAllRestrudents); 

export const RestrudentRoutes = router;
