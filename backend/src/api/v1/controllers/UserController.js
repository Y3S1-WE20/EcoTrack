const User = require('../../../models/User');

class UserController {
  constructor(db) {
    this.userModel = new User(db);
  }

  // Get or create user profile
  async getProfile(req, res) {
    try {
      const { userId } = req.auth;
      
      let user = await this.userModel.findByClerkId(userId);
      
      if (!user) {
        // Create user profile if it doesn't exist
        user = await this.userModel.create({
          clerkUserId: userId,
          profile: {
            onboardingCompleted: false,
            preferences: {}
          }
        });
      } else {
        // Update last login
        await this.userModel.updateLastLogin(userId);
      }
      
      res.json({ 
        success: true,
        user,
        message: 'Profile retrieved successfully' 
      });
    } catch (error) {
      console.error('Error in getProfile:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch user profile' 
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { userId } = req.auth;
      const updateData = req.body;
      
      // Don't allow updating clerkUserId
      delete updateData.clerkUserId;
      delete updateData._id;
      
      const result = await this.userModel.updateByClerkId(userId, {
        profile: updateData
      });
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }
      
      const updatedUser = await this.userModel.findByClerkId(userId);
      
      res.json({ 
        success: true,
        user: updatedUser,
        message: 'Profile updated successfully' 
      });
    } catch (error) {
      console.error('Error in updateProfile:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to update profile' 
      });
    }
  }

  // Delete user account
  async deleteAccount(req, res) {
    try {
      const { userId } = req.auth;
      
      // Also delete user's items
      const Item = require('../model/Item');
      const itemModel = new Item(req.db);
      await itemModel.deleteByUserId(userId);
      
      // Delete user
      await this.userModel.delete(userId);
      
      res.json({ 
        success: true,
        message: 'Account deleted successfully' 
      });
    } catch (error) {
      console.error('Error in deleteAccount:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to delete account' 
      });
    }
  }

  // Get user statistics
  async getStats(req, res) {
    try {
      const { userId } = req.auth;
      
      const Item = require('../model/Item');
      const itemModel = new Item(req.db);
      
      const itemCount = await itemModel.count({ userId });
      const user = await this.userModel.findByClerkId(userId);
      
      res.json({ 
        success: true,
        stats: {
          totalItems: itemCount,
          memberSince: user?.createdAt,
          lastLogin: user?.lastLogin
        }
      });
    } catch (error) {
      console.error('Error in getStats:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch statistics' 
      });
    }
  }
}

module.exports = UserController;