
// EcoTrack backend server
// Features:
// - MongoDB integration
// - Habit tracking API
// - CO2 calculation engine
// - CORS enabled
// - JSON body parsing
// - graceful shutdown

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Load environment variables from backend/.env explicitly so starting the
// server from the repository root still picks up the backend env file.
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { connectDB, seedInitialData } = require('./config/database');
const habitRoutes = require('./routes/habitRoutes');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
// const chatRoutes = require('./routes/chatRoutes'); // Old complex chat
const simpleChatRoutes = require('./routes/simpleChatRoutes'); // New simple chat
const motivationRoutes = require('./routes/motivationRoutes'); // Motivation hub routes
const notificationRoutes = require('./routes/notificationRoutes'); // Notification routes
const config = require('./config/config');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const PORT = config.PORT;

// API Routes
app.use(`${config.API_PREFIX}/auth`, authRoutes);
app.use(`${config.API_PREFIX}/habits`, habitRoutes);
app.use(`${config.API_PREFIX}/profile`, profileRoutes);
app.use(`${config.API_PREFIX}/chat`, simpleChatRoutes); // Using new simple chat
app.use(`${config.API_PREFIX}/motivation`, motivationRoutes); // Motivation hub routes
app.use(`${config.API_PREFIX}/notifications`, notificationRoutes); // Notification routes

// Health check routes
app.get('/', (req, res) => {
	res.json({ 
		message: 'EcoTrack backend is running',
		version: config.API_VERSION,
		timestamp: new Date().toISOString()
	});
});

app.get('/api/health', (req, res) => {
	res.json({ 
		status: 'healthy',
		uptime: process.uptime(),
		timestamp: new Date().toISOString()
	});
});

// 404 handler
app.use((req, res) => {
	res.status(404).json({
		success: false,
		error: 'Route not found'
	});
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error('Error:', err);
	res.status(500).json({
		success: false,
		error: config.NODE_ENV === 'development' ? err.message : 'Internal server error'
	});
});

// Initialize database and start server
const startServer = async () => {
	try {
		// Connect to MongoDB
		await connectDB();
		console.log('✅ Database connected successfully');

		// Seed initial data
		await seedInitialData();
		console.log('✅ Initial data seeded');

		// Start server
		const server = app.listen(PORT, '0.0.0.0', () => {
			console.log(`🚀 EcoTrack backend listening on http://localhost:${PORT}`);
			console.log(`🌐 Also accessible at http://0.0.0.0:${PORT} for mobile devices`);
			console.log(`📚 API Documentation: http://localhost:${PORT}${config.API_PREFIX}`);
		});

		// Graceful shutdown
		const shutdown = (signal) => {
			console.log(`\n⏹️  Received ${signal}, shutting down gracefully...`);
			server.close(() => {
				console.log('🔌 HTTP server closed.');
				process.exit(0);
			});
			// Force exit after 10s
			setTimeout(() => {
				console.error('⚠️  Forcing shutdown');
				process.exit(1);
			}, 10000).unref();
		};

		process.on('SIGINT', () => shutdown('SIGINT'));
		process.on('SIGTERM', () => shutdown('SIGTERM'));

	} catch (error) {
		console.error('❌ Failed to start server:', error);
		process.exit(1);
	}
};

// Start the application
startServer();

