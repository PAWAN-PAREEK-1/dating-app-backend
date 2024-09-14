import express from 'express';
import { authMiddleware } from '../../middelware/tokenValidate.js';
import { getMessages, markMessagesAsRead, sendMediaMessage, sendMessage } from '../../controller/user/chatController.js';
import { uploadChatMedia } from '../../middelware/multerCloudinary.js';


const router = express.Router();


router.route('/').post(authMiddleware,sendMessage);
router.route('/:id').get( authMiddleware, getMessages);
router.route('/read').post( authMiddleware, markMessagesAsRead);
router.route('/media').post( authMiddleware, uploadChatMedia.array('chatMedia'),sendMediaMessage);

export {router as chat}
