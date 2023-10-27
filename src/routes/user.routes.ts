import express, { Router } from 'express';
import {
  addPolicies,
  logUser,
  storeUserData,
} from '../controllers/user.controller';

export const login: Router = express.Router();
login.get('/user/login', logUser);

const router: Router = express.Router();
router.post('/user/policies', addPolicies);
router.put('/user/store', storeUserData);
export default router;
