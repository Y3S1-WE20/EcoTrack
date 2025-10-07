const express = require('express');
const router = express.Router();

// User routes - all require authentication middleware (applied in parent router)
module.exports = (userController) => {
  // Get user profile
  router.get('/profile', async (req, res) => {
    await userController.getProfile(req, res);
  });

  // Update user profile
  router.put('/profile', async (req, res) => {
    await userController.updateProfile(req, res);
  });

  // Delete user account
  router.delete('/profile', async (req, res) => {
    await userController.deleteAccount(req, res);
  });

  // Get user statistics
  router.get('/stats', async (req, res) => {
    await userController.getStats(req, res);
  });

  return router;
};