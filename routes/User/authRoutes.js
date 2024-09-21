import express from 'express';
import { login, registerUser, resetPassword } from '../../controller/user/authcontroller.js';
import { userEmailAndMobileCheck, userNameCheck } from '../../middelware/checkUsername.js';
import { verifyEmail } from '../../controller/user/verificationController.js';
import { authMiddleware } from '../../middelware/tokenValidate.js';


const router = express.Router();

// Define a POST route for '/login'
router.route('/register').post(userEmailAndMobileCheck,userNameCheck,registerUser);
router.route('/login').post(login);
router.route('/verify').post(verifyEmail);
router.route('/reset').post(authMiddleware,resetPassword);

export {router as auth}
