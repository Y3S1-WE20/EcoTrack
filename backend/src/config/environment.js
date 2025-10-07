require('dotenv').config();

const config = {
  // Server configuration
  port: process.env.PORT || 4000,
  
  // Database configuration
  mongodb: {
    uri: process.env.MONGODB_URI,
    databaseName: process.env.DATABASE_NAME
  },
  
  // Clerk configuration
  clerk: {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY
  },
  
  // CORS configuration
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8082',
    credentials: true
  },
  
  // Node environment
  nodeEnv: process.env.NODE_ENV || 'development'
};

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'DATABASE_NAME',
  'CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

module.exports = config;