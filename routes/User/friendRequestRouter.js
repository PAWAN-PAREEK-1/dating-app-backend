import express from 'express';
import { authMiddleware } from '../../middelware/tokenValidate.js';
import { blockOrUnblockUser, changeRequestStatus, deleteMesageForFriend, getAllFriendRequest, getUserFriends, sendRequest } from '../../controller/user/friendRequestController.js';


const router = express.Router();


router.route('/:id').post(authMiddleware,sendRequest);
router.route('/request').get(authMiddleware,getAllFriendRequest);
router.route('/status').put(authMiddleware,changeRequestStatus);
router.route('/').get(authMiddleware,getUserFriends);
router.route('/').put(authMiddleware,blockOrUnblockUser);
router.route('/deletchat/:id').put(authMiddleware,deleteMesageForFriend);

export {router as friendRequest}
