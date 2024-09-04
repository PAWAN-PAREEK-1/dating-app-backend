import express from 'express';
import { login, registerUser } from '../../controller/user/authcontroller.js';

const router = express.Router();

// Define a POST route for '/login'
router.route('/register').post(registerUser);
router.route('/login').post(login);

export {router as auth}
