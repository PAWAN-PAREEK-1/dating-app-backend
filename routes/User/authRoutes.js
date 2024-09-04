import express from 'express';
import { login, protect, registerUser } from '../../controller/user/authcontroller.js';
import { authmiddleware } from '../../middelware/tokenValidate.js';

const router = express.Router();

// Define a POST route for '/login'
router.route('/register').post(registerUser);
router.route('/login').post(login);
router.route('/protect').get(authmiddleware, protect);

export {router as auth}
