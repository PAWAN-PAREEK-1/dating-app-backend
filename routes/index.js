import express from 'express';
import {auth} from './User/authRoutes.js';  // Ensure you have auth.js or the appropriate file for auth
import {profileRoute} from './User/profileRoutes.js'
import {preferences} from './User/prefrencesRoutes.js'
import { usersData } from './User/allUserRoutes.js';
import { friendRequest } from './User/friendRequestRouter.js';
import { chat } from './User/chatRoutes.js';
import { post } from './User/postRoutes.js';

const router = express.Router();

// Use the auth middleware for routes under '/user'
router.use('/user/auth', auth);
router.use('/user/profile', profileRoute);
router.use('/user/prefrence', preferences);
router.use('/user', usersData);
router.use('/user/friend', friendRequest);
router.use('/user/chat', chat);
router.use('/user/post', post);


// Export the router
export default router;
