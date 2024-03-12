import express from 'express';
import * as userController from '../controllers/userController';

const router = express.Router();

// Register a new user
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/refresh-token', userController.refreshAccessToken);


export default router;