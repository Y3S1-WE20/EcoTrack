const express = require('express');
const router = express.Router();
const { submitQuiz, getProfile, updateChallengeProgress, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

// All profile routes require authentication
router.use(protect);

// POST /api/v1/profile/quiz - Submit onboarding quiz
router.post('/quiz', submitQuiz);

// GET /api/v1/profile - Get complete user profile
router.get('/', getProfile);

// PUT /api/v1/profile - Update user profile
router.put('/', updateProfile);

// PUT /api/v1/profile/challenge - Update challenge progress
router.put('/challenge', updateChallengeProgress);

// GET /api/v1/profile/leaderboard - private leaderboard within user's groups or global (privacy-first)
router.get('/leaderboard', async (req, res) => {
	// Controller inline for now: returns top users by activitiesLogged (privacy-first: return only displayName, badgeCount, score)
	try {
		const User = require('../models/User');
		const top = await User.find({}).sort({'stats.activitiesLogged': -1}).limit(10).select('name badges stats');
		const data = top.map(u => ({ name: u.name, badges: u.badges?.length || 0, activitiesLogged: u.stats?.activitiesLogged || 0 }));
		res.json({ success: true, data });
	} catch (error) {
		console.error('Leaderboard error:', error);
		res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
	}
});

// GET /api/v1/profile/report/weekly - returns weekly summary for the authenticated user
router.get('/report/weekly', async (req, res) => {
	try {
		const HabitLog = require('../models/HabitLog');
		const userId = req.user.userId;
		const now = new Date();
		const weekStart = new Date(now);
		weekStart.setDate(now.getDate() - now.getDay());
		weekStart.setHours(0,0,0,0);
		const weekEnd = new Date(weekStart);
		weekEnd.setDate(weekStart.getDate() + 6);
		weekEnd.setHours(23,59,59,999);

		const daily = await HabitLog.aggregate([
			{ $match: { userId, date: { $gte: weekStart, $lte: weekEnd } } },
			{ $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, totalCO2: { $sum: '$co2Impact' }, count: { $sum: 1 } } },
			{ $sort: { '_id': 1 } }
		]);

		res.json({ success: true, data: { period: { start: weekStart, end: weekEnd }, daily } });
	} catch (error) {
		console.error('Weekly report error:', error);
		res.status(500).json({ success: false, error: 'Failed to generate weekly report' });
	}
});

// POST /api/v1/profile/share - returns a privacy-first payload for sharing achievement cards
router.post('/share', async (req, res) => {
	try {
		const { badgeId } = req.body;
		const userId = req.user.userId;
		const User = require('../models/User');
		const user = await User.findById(userId).select('name badges');
		if (!user) return res.status(404).json({ success: false, error: 'User not found' });

		const badge = user.badges?.find(b => b.id === badgeId || b._id == badgeId);
		if (!badge) return res.status(404).json({ success: false, error: 'Badge not found' });

		// Return a privacy-first share payload (no raw data)
		const payload = {
			title: `${user.name} earned the "${badge.name}" badge!`,
			subtitle: badge.description,
			icon: badge.icon || '🏆',
			earnedAt: badge.earnedAt
		};

		res.json({ success: true, data: payload });
	} catch (error) {
		console.error('Share error:', error);
		res.status(500).json({ success: false, error: 'Failed to prepare share payload' });
	}
});

// PUT /api/v1/profile/goal/weekly - set or update weekly CO2 target
router.put('/goal/weekly', async (req, res) => {
	try {
		const { targetKg } = req.body;
		const User = require('../models/User');
		const userId = req.user.userId;
		if (typeof targetKg !== 'number' || targetKg <= 0) return res.status(400).json({ success:false, error: 'Invalid target' });

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ success:false, error: 'User not found' });

		user.carbonProfile.goals.weekly = targetKg;
		await user.save();

		res.json({ success: true, data: { weeklyGoal: targetKg } });
	} catch (err) {
		console.error('Set weekly target error:', err);
		res.status(500).json({ success:false, error: 'Failed to set weekly target' });
	}
});

// GET /api/v1/profile/recommendations - returns recommended targets based on past data
router.get('/recommendations', async (req, res) => {
	try {
		const User = require('../models/User');
		const HabitLog = require('../models/HabitLog');
		const userId = req.user.userId;

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ success:false, error: 'User not found' });

		// compute average weekly CO2 over last 4 weeks
		const now = new Date();
		const past = new Date();
		past.setDate(now.getDate() - 28);

		const agg = await HabitLog.aggregate([
			{ $match: { userId, date: { $gte: past, $lte: now } } },
			{ $group: { _id: { $week: '$date' }, totalCO2: { $sum: '$co2Impact' } } }
		]);

		const weeklyTotals = agg.map(a => a.totalCO2 || 0);
		const avgWeekly = weeklyTotals.length ? (weeklyTotals.reduce((s,t)=>s+t,0)/weeklyTotals.length) : 0;

		// Recommend a small improvement (10%) or keep current if already low
		const recommended = Math.max(10, Math.round(avgWeekly * 0.9));

		res.json({ success: true, data: { avgWeekly, recommended } });
	} catch (err) {
		console.error('Recommendations error:', err);
		res.status(500).json({ success:false, error: 'Failed to compute recommendations' });
	}
});

module.exports = router;