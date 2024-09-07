import express from 'express';
import { authMiddleware } from '../../middelware/tokenValidate.js';
import { getAllUsers, getUsersByPreferences, searchUser } from '../../controller/user/userController.js';

const router = express.Router();

// Define a POST route for '/login'
router.route('/').get(authMiddleware,getAllUsers);
router.route('/search').get(authMiddleware,searchUser);
router.route('/preference').get(authMiddleware,getUsersByPreferences);

export {router as usersData}
