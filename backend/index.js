
// Simple Express server for EcoTrack backend
// Features:
// - dotenv config
// - CORS enabled
// - JSON body parsing
// - Clerk authentication middleware
// - health check and example routes
// - graceful shutdown

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { MongoClient } = require('mongodb');
const clerkClient = require('@clerk/clerk-sdk-node');
require('dotenv').config();

const app = express();

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;
const databaseName = process.env.DATABASE_NAME;
let db;

const connectToMongoDB = async () => {
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db(databaseName);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connect to MongoDB
connectToMongoDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 4000;

// Custom Clerk authentication middleware
const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = await clerkClient.verifyToken(token);
    req.auth = { userId: decoded.sub };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Simple routes
app.get('/', (req, res) => {
	res.send('EcoTrack backend is running');
});

app.get('/api/ping', (req, res) => {
	res.json({ ok: true, ts: Date.now() });
});

app.get('/api/health', async (req, res) => {
	try {
		// Test MongoDB connection
		await db.admin().ping();
		const collections = await db.listCollections().toArray();
		
		res.json({ 
			ok: true, 
			timestamp: new Date().toISOString(),
			database: databaseName,
			collections: collections.map(c => c.name),
			mongodb: 'connected'
		});
	} catch (error) {
		res.status(500).json({ 
			ok: false, 
			error: 'MongoDB connection failed',
			mongodb: 'disconnected' 
		});
	}
});

app.post('/api/echo', (req, res) => {
	res.json({ received: req.body });
});

// Public items routes (using MongoDB)
app.get('/api/items', async (req, res) => {
	try {
		const items = await db.collection('items').find({}).toArray();
		res.json({ items });
	} catch (error) {
		console.error('Error fetching items:', error);
		res.status(500).json({ error: 'Failed to fetch items' });
	}
});

app.post('/api/items', async (req, res) => {
	try {
		const { name } = req.body || {};
		if (!name) return res.status(400).json({ error: 'name is required' });
		
		const item = { 
			name, 
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
		
		const result = await db.collection('items').insertOne(item);
		const newItem = { _id: result.insertedId, ...item };
		res.status(201).json(newItem);
	} catch (error) {
		console.error('Error creating item:', error);
		res.status(500).json({ error: 'Failed to create item' });
	}
});

// Protected routes - require Clerk authentication
app.get('/api/protected/profile', requireAuth, async (req, res) => {
	try {
		const { userId } = req.auth;
		
		// Try to get user profile from database
		let userProfile = await db.collection('users').findOne({ userId });
		
		if (!userProfile) {
			// Create a basic profile if it doesn't exist
			userProfile = {
				userId,
				createdAt: new Date().toISOString(),
				lastLogin: new Date().toISOString()
			};
			await db.collection('users').insertOne(userProfile);
		} else {
			// Update last login
			await db.collection('users').updateOne(
				{ userId },
				{ $set: { lastLogin: new Date().toISOString() } }
			);
		}
		
		res.json({ 
			message: 'This is a protected route', 
			userId,
			userProfile,
			user: req.auth 
		});
	} catch (error) {
		console.error('Error fetching user profile:', error);
		res.status(500).json({ error: 'Failed to fetch user profile' });
	}
});

app.get('/api/protected/user-items', requireAuth, async (req, res) => {
	try {
		const { userId } = req.auth;
		const userItems = await db.collection('userItems').find({ userId }).toArray();
		res.json({ items: userItems, userId });
	} catch (error) {
		console.error('Error fetching user items:', error);
		res.status(500).json({ error: 'Failed to fetch user items' });
	}
});

app.post('/api/protected/user-items', requireAuth, async (req, res) => {
	try {
		const { userId } = req.auth;
		const { name } = req.body || {};
		if (!name) return res.status(400).json({ error: 'name is required' });
		
		const item = { 
			name,
			userId,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
		
		const result = await db.collection('userItems').insertOne(item);
		const newItem = { _id: result.insertedId, ...item };
		res.status(201).json(newItem);
	} catch (error) {
		console.error('Error creating user item:', error);
		res.status(500).json({ error: 'Failed to create user item' });
	}
});

// Start server
const server = app.listen(PORT, () => {
	console.log(`EcoTrack backend listening on http://localhost:${PORT}`);
});

// Graceful shutdown
const shutdown = (signal) => {
	console.log(`\nReceived ${signal}, shutting down...`);
	server.close(() => {
		console.log('HTTP server closed. Exiting process.');
		process.exit(0);
	});
	// Force exit after 10s
	setTimeout(() => {
		console.error('Forcing shutdown');
		process.exit(1);
	}, 10000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

