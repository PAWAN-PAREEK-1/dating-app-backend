import express from 'express';
import { authMiddleware } from '../../middelware/tokenValidate.js';
import { createProfile, getFullProfile } from '../../controller/user/profileController.js';
const router = express.Router();

// router.route('/').get(authmiddleware,profile)
router.route('/').post(authMiddleware,createProfile)
                 .get(authMiddleware,getFullProfile);

export {router as profileRoute}
