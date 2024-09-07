import express from 'express';
import { authMiddleware } from '../../middelware/tokenValidate.js';
import { changeRequestStatus, getAllFriendRequest, sendRequest } from '../../controller/user/friendRequestController.js';


const router = express.Router();


router.route('/:id').post(authMiddleware,sendRequest);
router.route('/').get(authMiddleware,getAllFriendRequest);
router.route('/status').put(authMiddleware,changeRequestStatus);

export {router as friendRequest}
