import express from 'express';
import { authMiddleware } from '../../middelware/tokenValidate.js';
import { getMessages, markMessagesAsRead, sendMessage } from '../../controller/user/chatController.js';


const router = express.Router();


router.route('/').post(authMiddleware,sendMessage);
router.route('/:id').get( authMiddleware, getMessages);
router.route('/read').post( authMiddleware, markMessagesAsRead);

export {router as chat}
