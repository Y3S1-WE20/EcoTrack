// EcoTrack Backend API Server
// Structured backend following technical architecture
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Import configuration and database
const config = require('./src/config/environment');
const DatabaseConfig = require('./src/config/database');
const createV1Router = require('./src/api/v1');

const app = express();
const dbConfig = new DatabaseConfig();
let db;

const initializeDatabase = async () => {
  db = await dbConfig.connect();
  initializeRoutes(); // Initialize routes after database connection
};

// Middleware
app.use(cors(config.cors));
app.use(morgan('combined'));
app.use(express.json());

// Health check routes
app.get('/', (req, res) => {
  res.json({
    message: 'EcoTrack Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

app.get('/api/ping', (req, res) => {
  res.json({
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', async (req, res) => {
  const healthStatus = await dbConfig.healthCheck();
  const response = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: healthStatus
  };
  const statusCode = healthStatus.status === 'connected' ? 200 : 503;
  res.status(statusCode).json(response);
});

// API Routes
app.use('/api/v1', (req, res, next) => {
  if (!db) {
    return res.status(503).json({
      error: 'Database not ready',
      message: 'Please wait for database connection'
    });
  }
  req.db = db;
  next();
});

// Initialize v1 router after database connection
let v1Router;
const initializeRoutes = () => {
  if (db && !v1Router) {
    v1Router = createV1Router(db);
    app.use('/api/v1', v1Router);
  }
};

// Legacy routes for backward compatibility
app.get('/api/protected/profile', (req, res) => {
  res.redirect(301, '/api/v1/users/profile');
});

app.put('/api/protected/profile', (req, res) => {
  res.redirect(301, '/api/v1/users/profile');
});

app.delete('/api/protected/profile', (req, res) => {
  res.redirect(301, '/api/v1/users/profile');
});

app.get('/api/protected/stats', (req, res) => {
  res.redirect(301, '/api/v1/users/stats');
});

app.get('/api/protected/user-items', (req, res) => {
  res.redirect(301, '/api/v1/items');
});

app.post('/api/protected/user-items', (req, res) => {
  res.redirect(301, '/api/v1/items');
});

app.put('/api/protected/user-items/:id', (req, res) => {
  res.redirect(301, `/api/v1/items/${req.params.id}`);
});

app.delete('/api/protected/user-items/:id', (req, res) => {
  res.redirect(301, `/api/v1/items/${req.params.id}`);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();
    const server = app.listen(config.port, () => {
      console.log(` EcoTrack Backend running on http://localhost:${config.port}`);
      console.log(` Environment: ${config.nodeEnv}`);
      console.log(` Database: ${config.mongodb.databaseName}`);
      console.log(` Auth: Clerk JWT`);
    });

    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        console.log('HTTP server closed.');
        try {
          await dbConfig.disconnect();
          console.log('Database connection closed.');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
