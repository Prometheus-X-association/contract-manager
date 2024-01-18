import express, { Router } from 'express';
import { storeUserData } from '../controllers/user.controller';

const router: Router = express.Router();
router.put('/user/store', storeUserData);
export default router;
