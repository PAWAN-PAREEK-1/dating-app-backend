import express from 'express';
import { authMiddleware } from '../../middelware/tokenValidate.js';
import { upload }  from '../../middelware/multerCloudinary.js'
import { createOrUpdateProfile, getFullProfile } from '../../controller/user/profileController.js';
const router = express.Router();

// router.route('/').get(authmiddleware,profile)
router.route('/').post(authMiddleware,  upload.array('profilePictures'), createOrUpdateProfile)
                 .get(authMiddleware,getFullProfile);

export {router as profileRoute}
