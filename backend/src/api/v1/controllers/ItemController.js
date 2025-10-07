      const Item = require('../../../models/Item');

class ItemController {
  constructor(db) {
    this.itemModel = new Item(db);
  }

  // Get all public items
  async getAllItems(req, res) {
    try {
      const { page = 1, limit = 10, category } = req.query;
      const skip = (page - 1) * limit;
      
      const filter = category ? { category } : {};
      const options = { 
        skip: parseInt(skip), 
        limit: parseInt(limit),
        sort: { createdAt: -1 }
      };
      
      const items = await this.itemModel.findAll(filter, options);
      const total = await this.itemModel.count(filter);
      
      res.json({ 
        success: true,
        items,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error in getAllItems:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch items' 
      });
    }
  }

  // Create new public item
  async createItem(req, res) {
    try {
      const { name, description, category, tags } = req.body;
      
      if (!name?.trim()) {
        return res.status(400).json({ 
          success: false,
          error: 'Item name is required' 
        });
      }
      
      const item = await this.itemModel.create({
        name: name.trim(),
        description: description?.trim() || '',
        category: category || 'general',
        tags: Array.isArray(tags) ? tags : [],
        isPublic: true
      });
      
      res.status(201).json({ 
        success: true,
        item,
        message: 'Item created successfully' 
      });
    } catch (error) {
      console.error('Error in createItem:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to create item' 
      });
    }
  }

  // Get user's personal items
  async getUserItems(req, res) {
    try {
      const { userId } = req.auth;
      const { page = 1, limit = 10, category } = req.query;
      const skip = (page - 1) * limit;
      
      const filter = { userId };
      if (category) filter.category = category;
      
      const options = { 
        skip: parseInt(skip), 
        limit: parseInt(limit),
        sort: { createdAt: -1 }
      };
      
      const items = await this.itemModel.findByUserId(userId, options);
      const total = await this.itemModel.count(filter);
      
      res.json({ 
        success: true,
        items,
        userId,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error in getUserItems:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch user items' 
      });
    }
  }

  // Create user's personal item
  async createUserItem(req, res) {
    try {
      const { userId } = req.auth;
      const { name, description, category, tags, isPrivate = true } = req.body;
      
      if (!name?.trim()) {
        return res.status(400).json({ 
          success: false,
          error: 'Item name is required' 
        });
      }
      
      const item = await this.itemModel.create({
        name: name.trim(),
        description: description?.trim() || '',
        category: category || 'personal',
        tags: Array.isArray(tags) ? tags : [],
        userId,
        isPrivate: Boolean(isPrivate)
      });
      
      res.status(201).json({ 
        success: true,
        item,
        message: 'Personal item created successfully' 
      });
    } catch (error) {
      console.error('Error in createUserItem:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to create personal item' 
      });
    }
  }

  // Update user's item
  async updateUserItem(req, res) {
    try {
      const { userId } = req.auth;
      const { id } = req.params;
      const updateData = req.body;
      
      // First check if item belongs to user
      const existingItem = await this.itemModel.findById(id);
      if (!existingItem) {
        return res.status(404).json({ 
          success: false,
          error: 'Item not found' 
        });
      }
      
      if (existingItem.userId !== userId) {
        return res.status(403).json({ 
          success: false,
          error: 'Not authorized to update this item' 
        });
      }
      
      // Remove fields that shouldn't be updated
      delete updateData._id;
      delete updateData.userId;
      delete updateData.createdAt;
      
      const result = await this.itemModel.update(id, updateData);
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'Item not found' 
        });
      }
      
      const updatedItem = await this.itemModel.findById(id);
      
      res.json({ 
        success: true,
        item: updatedItem,
        message: 'Item updated successfully' 
      });
    } catch (error) {
      console.error('Error in updateUserItem:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to update item' 
      });
    }
  }

  // Delete user's item
  async deleteUserItem(req, res) {
    try {
      const { userId } = req.auth;
      const { id } = req.params;
      
      // First check if item belongs to user
      const existingItem = await this.itemModel.findById(id);
      if (!existingItem) {
        return res.status(404).json({ 
          success: false,
          error: 'Item not found' 
        });
      }
      
      if (existingItem.userId !== userId) {
        return res.status(403).json({ 
          success: false,
          error: 'Not authorized to delete this item' 
        });
      }
      
      await this.itemModel.delete(id);
      
      res.json({ 
        success: true,
        message: 'Item deleted successfully' 
      });
    } catch (error) {
      console.error('Error in deleteUserItem:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to delete item' 
      });
    }
  }
}

module.exports = ItemController;