const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');
const { authorization } = require('../middleware/authMiddleware');

// Get all posts
router.get('/', postsController.getAllPosts);

// Get post by ID
router.get('/:id', postsController.getPostById);

// Protected routes - require authentication
router.post('/', authorization, postsController.createPost);
router.put('/:id', authorization, postsController.updatePost);
router.delete('/:id', authorization, postsController.deletePost);
router.post('/:id/like', authorization, postsController.likePost);
router.delete('/:id/like', authorization, postsController.unlikePost);

module.exports = router;
