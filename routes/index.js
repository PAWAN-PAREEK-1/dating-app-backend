import express from 'express';
import {auth} from './User/authRoutes.js';  // Ensure you have auth.js or the appropriate file for auth

const router = express.Router();

// Use the auth middleware for routes under '/user'
router.use('/user', auth);

// Export the router
export default router;
