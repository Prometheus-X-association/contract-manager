import express from 'express';
import { getSomething } from '../controllers/catalog.bridge.controller';

const router = express.Router();

// Temporary route
router.get('/something', getSomething);

export default router;
