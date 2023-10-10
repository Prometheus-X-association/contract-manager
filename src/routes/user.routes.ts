import express, { Router } from 'express';
import { logUser } from '../controllers/user.controller';

const router: Router = express.Router();

//
router.get('/user/login', logUser);

export default router;
