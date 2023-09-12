import express from 'express';
import { logUser } from '../controllers/user.controller';

const router = express.Router();

// login
router.get('/login', logUser);

export default router;
