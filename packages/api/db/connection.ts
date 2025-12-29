import mongoose from 'mongoose';

interface ConnectionOptions {
  bufferCommands?: boolean;
  bufferMaxEntries?: number;
  useNewUrlParser?: boolean;
  useUnifiedTopology?: boolean;
}

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(uri?: string, options?: ConnectionOptions): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-tools-platform';
      
      const defaultOptions: ConnectionOptions = {
        bufferCommands: false,
        bufferMaxEntries: 0,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        ...options
      };

      await mongoose.connect(mongoUri, defaultOptions);
      
      this.isConnected = true;
      console.log('✅ Connected to MongoDB');

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
        this.isConnected = true;
      });

    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      this.isConnected = false;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('✅ Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  public getConnection(): typeof mongoose.connection {
    return mongoose.connection;
  }
}

// Export singleton instance and convenience function
export const dbConnection = DatabaseConnection.getInstance();
export const connectDB = (uri?: string, options?: ConnectionOptions) => dbConnection.connect(uri, options);
export const disconnectDB = () => dbConnection.disconnect();
export const getDBStatus = () => dbConnection.getConnectionStatus();

export default DatabaseConnection;