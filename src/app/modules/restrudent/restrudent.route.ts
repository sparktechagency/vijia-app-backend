import express from 'express';
import { RestrudentController } from './restrudent.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.get('/',auth(),RestrudentController.getAllRestrudents); 

router.get('/:id',auth(),RestrudentController.getSingleRestrudent);

export const RestrudentRoutes = router;
