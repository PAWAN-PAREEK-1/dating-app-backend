import express from 'express';
import { authMiddleware } from '../../middelware/tokenValidate.js';
import { uploadPostMedia } from '../../middelware/multerCloudinary.js';
import { addComment, createPost, deleteComment, deletePost, getComments, getMyPosts, getPost, getRandomPosts, likesPost } from '../../controller/user/postController.js';

const router = express.Router();


router.route('/my').get(authMiddleware,getMyPosts);
router.route('/like/:id').put(authMiddleware,likesPost);
router.route('/comment/:id').post(authMiddleware,addComment);
router.route('/comment/:id').delete(authMiddleware,deleteComment);
router.route('/comment/:id').get(authMiddleware,getComments);
router.route('/all').get(authMiddleware,getRandomPosts);
router.route('/').post(authMiddleware,uploadPostMedia.array("postMedia",10),createPost);
router.route('/:id').delete(authMiddleware,deletePost);
router.route('/:id').get(authMiddleware,getPost);



export {router as post}