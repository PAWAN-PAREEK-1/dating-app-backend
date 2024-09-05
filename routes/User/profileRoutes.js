import express from 'express';
import { authMiddleware } from '../../middelware/tokenValidate.js';
import { createOrUpdateProfile, getFullProfile } from '../../controller/user/profileController.js';
const router = express.Router();

// router.route('/').get(authmiddleware,profile)
router.route('/').post(authMiddleware,createOrUpdateProfile)
                 .get(authMiddleware,getFullProfile);

export {router as profileRoute}
