const express = require('express');
const router = express.Router();

// Item routes - all require authentication middleware (applied in parent router)
module.exports = (itemController) => {
  // Get user's items
  router.get('/', async (req, res) => {
    await itemController.getUserItems(req, res);
  });

  // Create new user item
  router.post('/', async (req, res) => {
    await itemController.createUserItem(req, res);
  });

  // Update user item
  router.put('/:id', async (req, res) => {
    await itemController.updateUserItem(req, res);
  });

  // Delete user item
  router.delete('/:id', async (req, res) => {
    await itemController.deleteUserItem(req, res);
  });

  return router;
};