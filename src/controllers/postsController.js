const { Post, User, Like } = require('../models');

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username'],
        },
        {
          model: Like,
          as: 'likes',
          attributes: ['id', 'user_id'],
        },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username'],
        },
        {
          model: Like,
          as: 'likes',
          attributes: ['id', 'user_id'],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    // Add the authenticated user's ID to the post data
    const postData = {
      ...req.body,
      userId: req.user.id,
    };

    const post = await Post.create(postData);
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user owns the post
    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    await post.update(req.body);
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user owns the post
    if (post.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.destroy();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Like a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Use the authenticated user's ID
    const userId = req.user.id;

    // Check if the like already exists
    const existingLike = await Like.findOne({
      where: {
        postId: post.id,
        userId,
      },
    });

    if (existingLike) {
      return res.status(400).json({ message: 'You already liked this post' });
    }

    // Create a new like
    const like = await Like.create({
      postId: post.id,
      userId,
    });

    res.status(201).json(like);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Unlike a post
exports.unlikePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Use the authenticated user's ID
    const userId = req.user.id;

    // Find and delete the like
    const like = await Like.findOne({
      where: {
        postId: post.id,
        userId,
      },
    });

    if (!like) {
      return res.status(404).json({ message: 'Like not found' });
    }

    await like.destroy();
    res.json({ message: 'Post unliked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
