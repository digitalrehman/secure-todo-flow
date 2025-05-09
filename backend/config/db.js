
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Function to get MongoDB client for Auth.js adapter
let mongoClient = null;
const getMongoClient = async () => {
  if (mongoClient) return mongoClient;
  
  mongoClient = new MongoClient(process.env.MONGODB_URI);
  await mongoClient.connect();
  return mongoClient;
};

module.exports = { connectDB, getMongoClient };
