import express, { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, allUsers } from '../controllers/user.controller'; // Ensure loginUser is imported
import upload from '../middleware/user.middleware'; // Assuming you have a middleware for handling file uploads
import { protect } from '../controllers/auth.middleware';

const router = express.Router();

// Route for user registration
router.post('/register', upload.single('pic'), (req: Request, res: Response, next: NextFunction) => registerUser(req, res, next));

// Route for user login
router.post('/login', (req: Request, res: Response, next: NextFunction) => loginUser(req, res, next));

// Route for fetching all users
router.get('/allUser', protect, (req: Request, res: Response, next: NextFunction) => allUsers(req, res, next));

export default router;
