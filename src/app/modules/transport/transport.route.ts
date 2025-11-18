import express from 'express';
import { TransportController } from './transport.controller';

const router = express.Router();

router.get('/', TransportController.searchTransportFromAPis); 

export const TransportRoutes = router;
