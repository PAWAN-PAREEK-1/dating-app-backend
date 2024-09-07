import express from 'express';
import { authMiddleware } from '../../middelware/tokenValidate.js';
import { changeRequestStatus, getAllFriendRequest, getUserFriends, sendRequest } from '../../controller/user/friendRequestController.js';


const router = express.Router();


router.route('/:id').post(authMiddleware,sendRequest);
router.route('/request').get(authMiddleware,getAllFriendRequest);
router.route('/status').put(authMiddleware,changeRequestStatus);
router.route('/').get(authMiddleware,getUserFriends);

export {router as friendRequest}
