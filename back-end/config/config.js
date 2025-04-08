const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Define the environment
const NODE_ENV = process.env.NODE_ENV || 'development';

// Path to the base .env file
const basePath = path.resolve(__dirname, '../.env');

// Path to the environment-specific .env file
const envPath = path.resolve(__dirname, `../.env.${NODE_ENV}`);

// Load the base .env file
dotenv.config({ path: basePath });

// Load the environment-specific .env file if it exists
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  
  // Override any base variables with environment-specific ones
  for (const key in envConfig) {
    process.env[key] = envConfig[key];
  }
}

module.exports = {
  // Server settings
  PORT: process.env.PORT || 5001,
  NODE_ENV,
  
  // MongoDB settings
  MONGODB_URI: process.env.MONGODB_URI,
  
  // External APIs
  ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY,
  FINNHUB_API_KEY: process.env.FINNHUB_API_KEY,
  
  // Client settings
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  
  // Determine if we're in production
  isProduction: NODE_ENV === 'production',
  
  // Determine if we're in development
  isDevelopment: NODE_ENV === 'development',
  
  // Determine if we're in test
  isTest: NODE_ENV === 'test'
}; 