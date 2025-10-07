const { MongoClient } = require('mongodb');

class DatabaseConfig {
  constructor() {
    this.mongoUri = process.env.MONGODB_URI;
    this.databaseName = process.env.DATABASE_NAME;
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      this.client = new MongoClient(this.mongoUri);
      await this.client.connect();
      this.db = this.client.db(this.databaseName);
      console.log('Connected to MongoDB successfully');
      return this.db;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    }
  }

  getDatabase() {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('Disconnected from MongoDB');
    }
  }

  async healthCheck() {
    try {
      if (!this.db) {
        return { status: 'disconnected', message: 'Database not connected' };
      }

      // Ping the database
      await this.db.admin().ping();
      
      // Get some basic stats
      const collections = await this.db.listCollections().toArray();
      const stats = await this.db.stats();

      return {
        status: 'connected',
        message: 'Database connection healthy',
        database: this.databaseName,
        collections: collections.length,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Database health check failed',
        error: error.message
      };
    }
  }
}

module.exports = DatabaseConfig;