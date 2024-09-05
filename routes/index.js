import express from 'express';
import {auth} from './User/authRoutes.js';  // Ensure you have auth.js or the appropriate file for auth
import {profileRoute} from './User/profileRoutes.js'
import {preferences} from './User/prefrencesRoutes.js'

const router = express.Router();

// Use the auth middleware for routes under '/user'
router.use('/user/auth', auth);
router.use('/user/profile', profileRoute);
router.use('/user/prefrence', preferences);


// Export the router
export default router;
