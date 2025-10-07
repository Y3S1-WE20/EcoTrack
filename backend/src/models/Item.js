const { MongoClient, ObjectId } = require('mongodb');

class Item {
  constructor(db) {
    this.db = db;
    this.collection = db.collection('items');
  }

  async create(itemData) {
    const item = {
      ...itemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await this.collection.insertOne(item);
    return { _id: result.insertedId, ...item };
  }

  async findById(id) {
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  async findAll(filter = {}, options = {}) {
    return await this.collection.find(filter, options).toArray();
  }

  async findByUserId(userId, options = {}) {
    return await this.collection.find({ userId }, options).toArray();
  }

  async update(id, updateData) {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date().toISOString() 
        } 
      }
    );
    return result;
  }

  async delete(id) {
    return await this.collection.deleteOne({ _id: new ObjectId(id) });
  }

  async deleteByUserId(userId) {
    return await this.collection.deleteMany({ userId });
  }

  async count(filter = {}) {
    return await this.collection.countDocuments(filter);
  }
}

module.exports = Item;