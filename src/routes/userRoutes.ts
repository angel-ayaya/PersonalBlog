import express from 'express';
import * as userController from '../controllers/userController';

const router = express.Router();

// Register a new user
router.post('/register', userController.registerUser);

export default router;