const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    const mongoURI = config.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('MongoDB URI is not defined in environment variables');
      console.error(`Please ensure your .env.${config.NODE_ENV} file contains a valid MONGODB_URI`);
      process.exit(1);
    }

    // Log which environment and connection we're using
    console.log(`Environment: ${config.NODE_ENV}`);
    
    // Don't log the full URI in production for security
    if (config.isProduction) {
      console.log('Connecting to MongoDB Atlas...');
    } else {
      console.log(`Connecting to MongoDB: ${mongoURI}`);
    }

    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 