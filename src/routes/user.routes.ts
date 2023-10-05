import express from 'express';
import { logUser } from '../controllers/user.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoints for user authentication
 * /login:
 *   get:
 *     summary: Get authentication token
 *     description: Used to obtain an authentication token for the user.
 *     responses:
 *       200:
 *         description: Success - authentication token retrieved successfully.
 */
router.get('/user/login', logUser);

export default router;
