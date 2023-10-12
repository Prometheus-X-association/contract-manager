import express, { Router } from 'express';
import { addPolicies, logUser } from '../controllers/user.controller';

const router: Router = express.Router();

//
router.get('/user/login', logUser);
router.post('/user/policies', addPolicies);

export default router;
