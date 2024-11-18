import express, { Request, Response, NextFunction } from 'express';
import { protect } from '../controllers/auth.middleware'; 
import { allMessage, sendMessage } from '../controllers/message.controller';

const router = express.Router();

router.post('/sendMessage', protect, (req: Request, res: Response, next: NextFunction) => sendMessage(req, res, next));

router.get('/:chatId', protect, (req: Request, res: Response, next: NextFunction) => allMessage(req, res, next));


export default router;
