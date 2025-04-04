import { User } from '../models/index.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }, // Don't return passwords
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new user
export const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);

    // Return the user without password
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update(req.body);

    // Return the user without password
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json(userResponse);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
