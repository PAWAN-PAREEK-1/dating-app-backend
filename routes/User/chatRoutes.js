import express from 'express';
import { authMiddleware } from '../../middelware/tokenValidate.js';
import { getMessages, sendMessage } from '../../controller/user/chatController.js';


const router = express.Router();


router.route('/').post(authMiddleware,sendMessage);
router.route('/:id').get( authMiddleware, getMessages);

export {router as chat}
