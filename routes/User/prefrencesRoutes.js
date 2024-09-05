import express from 'express';
import { authMiddleware } from '../../middelware/tokenValidate.js';
import { createOrUpdatePreferences } from '../../controller/user/prefrencesController.js';

const router = express.Router();

router.route('/').post(authMiddleware,createOrUpdatePreferences)

export {router as preferences}