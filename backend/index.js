
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
require('dotenv').config();

const { connectDB, seedInitialData } = require('./config/database');
const habitRoutes = require('./routes/habitRoutes');
const config = require('./config/config');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const PORT = config.PORT;

// API Routes
app.use(`${config.API_PREFIX}/habits`, habitRoutes);

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
		const server = app.listen(PORT, () => {
			console.log(`🚀 EcoTrack backend listening on http://localhost:${PORT}`);
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

