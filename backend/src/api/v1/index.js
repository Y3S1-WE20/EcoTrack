const express = require('express');
const { requireAuth } = require('../../middleware/auth');

// Import route modules
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');

// Initialize controllers
const UserController = require('./controllers/UserController');
const ItemController = require('./controllers/ItemController');

const createV1Router = (db) => {
  const router = express.Router();
  
  // Initialize controllers with database (with null check)
  if (!db) {
    throw new Error('Database instance is required for v1 router');
  }
  
  const userController = new UserController(db);
  const itemController = new ItemController(db);
  
  // Middleware to attach controllers to request
  router.use((req, res, next) => {
    req.userController = userController;
    req.itemController = itemController;
    next();
  });

  // Protected routes - require authentication
  router.use('/users', requireAuth, userRoutes(userController));
  router.use('/items', requireAuth, itemRoutes(itemController));

  return router;
};

module.exports = createV1Router;