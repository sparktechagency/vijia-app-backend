import express from 'express';
import { PreferenceController } from './preference.controller';

const router = express.Router();

router.get('/', PreferenceController); 

export const PreferenceRoutes = router;
