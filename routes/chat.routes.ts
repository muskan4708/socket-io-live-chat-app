import express, { Request, Response, NextFunction } from 'express';


import { protect } from '../controllers/auth.middleware';
import { accessChat, fetchChats,createGroupchat, renameGroup, addToGroup, removefromGroup, leaveGroup} from '../controllers/chat.controller'
const router = express.Router();

router.post('/', protect, (req: Request, res: Response, next: NextFunction) => accessChat(req, res, next));


router.get('/', protect, (req: Request, res: Response, next: NextFunction) => fetchChats(req, res, next));


 router.post('/group', protect, (req: Request, res: Response, next: NextFunction) => createGroupchat(req, res, next));

 router.put('/rename', protect, (req: Request, res: Response, next: NextFunction) => renameGroup(req, res, next));

  router.put('/groupremove', protect, (req: Request, res: Response, next: NextFunction) => removefromGroup(req, res, next));

 router.put('/groupadd', protect, (req: Request, res: Response, next: NextFunction) => addToGroup(req, res, next));

 router.put('/leaveGroup',protect,(req:Request,res:Response,next:NextFunction) =>leaveGroup(req,res,next))
export default router;

