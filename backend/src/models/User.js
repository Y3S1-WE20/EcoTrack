const { MongoClient, ObjectId } = require('mongodb');

class User {
  constructor(db) {
    this.db = db;
    this.collection = db.collection('users');
  }

  async create(userData) {
    const user = {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await this.collection.insertOne(user);
    return { _id: result.insertedId, ...user };
  }

  async findByClerkId(clerkUserId) {
    return await this.collection.findOne({ clerkUserId });
  }

  async findById(id) {
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  async updateByClerkId(clerkUserId, updateData) {
    const result = await this.collection.updateOne(
      { clerkUserId },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date().toISOString() 
        } 
      }
    );
    return result;
  }

  async updateLastLogin(clerkUserId) {
    return await this.updateByClerkId(clerkUserId, { 
      lastLogin: new Date().toISOString() 
    });
  }

  async delete(clerkUserId) {
    return await this.collection.deleteOne({ clerkUserId });
  }

  async findAll(filter = {}, options = {}) {
    return await this.collection.find(filter, options).toArray();
  }
}

module.exports = User;