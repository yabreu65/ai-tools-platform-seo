"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDBStatus = exports.disconnectDB = exports.connectDB = exports.dbConnection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
class DatabaseConnection {
    constructor() {
        this.isConnected = false;
    }
    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
    connect(uri, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isConnected) {
                return;
            }
            try {
                const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-tools-platform';
                const defaultOptions = Object.assign({ bufferCommands: false, bufferMaxEntries: 0, useNewUrlParser: true, useUnifiedTopology: true }, options);
                yield mongoose_1.default.connect(mongoUri, defaultOptions);
                this.isConnected = true;
                console.log('✅ Connected to MongoDB');
                // Handle connection events
                mongoose_1.default.connection.on('error', (error) => {
                    console.error('❌ MongoDB connection error:', error);
                    this.isConnected = false;
                });
                mongoose_1.default.connection.on('disconnected', () => {
                    console.log('⚠️ MongoDB disconnected');
                    this.isConnected = false;
                });
                mongoose_1.default.connection.on('reconnected', () => {
                    console.log('✅ MongoDB reconnected');
                    this.isConnected = true;
                });
            }
            catch (error) {
                console.error('❌ Failed to connect to MongoDB:', error);
                this.isConnected = false;
                throw error;
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isConnected) {
                return;
            }
            try {
                yield mongoose_1.default.disconnect();
                this.isConnected = false;
                console.log('✅ Disconnected from MongoDB');
            }
            catch (error) {
                console.error('❌ Error disconnecting from MongoDB:', error);
                throw error;
            }
        });
    }
    getConnectionStatus() {
        return this.isConnected && mongoose_1.default.connection.readyState === 1;
    }
    getConnection() {
        return mongoose_1.default.connection;
    }
}
// Export singleton instance and convenience function
exports.dbConnection = DatabaseConnection.getInstance();
const connectDB = (uri, options) => exports.dbConnection.connect(uri, options);
exports.connectDB = connectDB;
const disconnectDB = () => exports.dbConnection.disconnect();
exports.disconnectDB = disconnectDB;
const getDBStatus = () => exports.dbConnection.getConnectionStatus();
exports.getDBStatus = getDBStatus;
exports.default = DatabaseConnection;
