import express from 'express';
import { login, registerUser } from '../../controller/user/authcontroller.js';
import { userEmailAndMobileCheck, userNameCheck } from '../../middelware/checkUsername.js';
import { verifyEmail } from '../../controller/user/verificationController.js';


const router = express.Router();

// Define a POST route for '/login'
router.route('/register').post(userEmailAndMobileCheck,userNameCheck,registerUser);
router.route('/login').post(login);
router.route('/verify').post(verifyEmail);

export {router as auth}
