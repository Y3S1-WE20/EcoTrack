const clerkClient = require('@clerk/clerk-sdk-node');

// Clerk authentication middleware
const requireAuth = async (req, res, next) => {
  const sessionToken = req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionToken) {
    return res.status(401).json({ error: 'No session token provided' });
  }

  try {
    // Verify the session token with Clerk
    const session = await clerkClient.sessions.verifySession(sessionToken, sessionToken);
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid session token' });
    }

    // Add user info to the request object
    req.auth = {
      userId: session.userId,
      sessionId: session.id
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = {
  requireAuth
};