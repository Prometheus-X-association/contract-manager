import express, { Router } from 'express';
import { addPolicies, storeUserData } from '../controllers/user.controller';

const router: Router = express.Router();
router.post('/user/policies', addPolicies);
router.put('/user/store', storeUserData);
export default router;
