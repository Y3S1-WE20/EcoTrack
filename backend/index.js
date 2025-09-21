
// Simple Express server for EcoTrack backend
// Features:
// - dotenv config
// - CORS enabled
// - JSON body parsing
// - health check and example routes
// - graceful shutdown

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 4000;

// Simple routes
app.get('/', (req, res) => {
	res.send('EcoTrack backend is running');
});

app.get('/api/ping', (req, res) => {
	res.json({ ok: true, ts: Date.now() });
});

app.post('/api/echo', (req, res) => {
	res.json({ received: req.body });
});

// Example: simple in-memory items resource (GET, POST)
let items = [];

app.get('/api/items', (req, res) => {
	res.json({ items });
});

app.post('/api/items', (req, res) => {
	const { name } = req.body || {};
	if (!name) return res.status(400).json({ error: 'name is required' });
	const item = { id: items.length + 1, name, createdAt: new Date().toISOString() };
	items.push(item);
	res.status(201).json(item);
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

