import express from 'express';
import { authMiddleware } from '../../middelware/tokenValidate.js';
import { uploadProfile }  from '../../middelware/multerCloudinary.js'
import { createOrUpdateProfile, getFullProfile } from '../../controller/user/profileController.js';
const router = express.Router();


router.route('/').post(authMiddleware,  uploadProfile.array('profilePictures'), createOrUpdateProfile)
                 .get(authMiddleware,getFullProfile);

export {router as profileRoute}
