import express from 'express';
import * as postsController from '../controllers/postsController.js';
import { authorization } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all posts
// router.get('/', postsController.getAllPosts);

// // Get post by ID
// router.get('/:id', postsController.getPostById);

// // Protected routes - require authentication
// router.post('/', authorization, postsController.createPost);
// router.put('/:id', authorization, postsController.updatePost);
// router.delete('/:id', authorization, postsController.deletePost);
// router.post('/:id/like', authorization, postsController.likePost);
// router.delete('/:id/like', authorization, postsController.unlikePost);

export default router;
