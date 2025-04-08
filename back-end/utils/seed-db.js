// Load environment variables from config
const config = require('../config/config');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const connectDB = require('../config/db');

// Import models
const User = require('../models/User');
const Stock = require('../models/Stock');

// Check if MongoDB URI is available
if (!config.MONGODB_URI) {
  console.error('MongoDB URI not found in environment variables.');
  console.error(`Make sure the .env.${config.NODE_ENV} file exists and contains MONGODB_URI.`);
  process.exit(1);
}

// Sample data
const users = [
  {
    login: 'testuser',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    userID: uuidv4(),
    cashBalance: 10000.00,
    email: 'test@example.com'
  },
  {
    login: 'johnsmith',
    password: 'password123',
    firstName: 'John',
    lastName: 'Smith',
    userID: uuidv4(),
    cashBalance: 25000.00,
    email: 'john@example.com'
  },
  {
    login: 'janedoe',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Doe',
    userID: uuidv4(),
    cashBalance: 15000.00,
    email: 'jane@example.com'
  }
];

// Sample stocks data will be generated after users are created
// We need the userIDs from the created users
const generateStocks = (users) => {
  const stocks = [];
  
  // Test User's stocks
  const testUserStocks = [
    {
      userID: users[0].userID,
      symbol: 'AAPL',
      moneyInvested: 2000.00,
      unitsOwned: 10,
      companyName: 'Apple Inc.',
      sector: 'Technology',
      purchaseHistory: [
        {
          date: new Date('2023-01-15'),
          price: 150.00,
          units: 5
        },
        {
          date: new Date('2023-03-20'),
          price: 170.00,
          units: 5
        }
      ]
    },
    {
      userID: users[0].userID,
      symbol: 'MSFT',
      moneyInvested: 1500.00,
      unitsOwned: 5,
      companyName: 'Microsoft Corporation',
      sector: 'Technology',
      purchaseHistory: [
        {
          date: new Date('2023-02-10'),
          price: 300.00,
          units: 5
        }
      ]
    },
    {
      userID: users[0].userID,
      symbol: 'TSLA',
      moneyInvested: 1000.00,
      unitsOwned: 4,
      companyName: 'Tesla, Inc.',
      sector: 'Automotive',
      purchaseHistory: [
        {
          date: new Date('2023-04-05'),
          price: 250.00,
          units: 4
        }
      ]
    }
  ];
  
  // John Smith's stocks
  const johnStocks = [
    {
      userID: users[1].userID,
      symbol: 'AMZN',
      moneyInvested: 3200.00,
      unitsOwned: 20,
      companyName: 'Amazon.com, Inc.',
      sector: 'Consumer Cyclical',
      purchaseHistory: [
        {
          date: new Date('2023-01-05'),
          price: 160.00,
          units: 20
        }
      ]
    },
    {
      userID: users[1].userID,
      symbol: 'GOOGL',
      moneyInvested: 2800.00,
      unitsOwned: 20,
      companyName: 'Alphabet Inc.',
      sector: 'Technology',
      purchaseHistory: [
        {
          date: new Date('2023-03-15'),
          price: 140.00,
          units: 20
        }
      ]
    }
  ];
  
  // Jane Doe's stocks
  const janeStocks = [
    {
      userID: users[2].userID,
      symbol: 'NFLX',
      moneyInvested: 1200.00,
      unitsOwned: 2,
      companyName: 'Netflix, Inc.',
      sector: 'Communication Services',
      purchaseHistory: [
        {
          date: new Date('2023-02-20'),
          price: 600.00,
          units: 2
        }
      ]
    },
    {
      userID: users[2].userID,
      symbol: 'DIS',
      moneyInvested: 1800.00,
      unitsOwned: 15,
      companyName: 'The Walt Disney Company',
      sector: 'Communication Services',
      purchaseHistory: [
        {
          date: new Date('2023-04-10'),
          price: 120.00,
          units: 15
        }
      ]
    },
    {
      userID: users[2].userID,
      symbol: 'SBUX',
      moneyInvested: 1050.00,
      unitsOwned: 10,
      companyName: 'Starbucks Corporation',
      sector: 'Consumer Cyclical',
      purchaseHistory: [
        {
          date: new Date('2023-05-01'),
          price: 105.00,
          units: 10
        }
      ]
    }
  ];
  
  return [...testUserStocks, ...johnStocks, ...janeStocks];
};

// Function to seed the database
const seedDB = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Clear the existing database
    await User.deleteMany({});
    await Stock.deleteMany({});
    
    console.log('Database cleared');
    
    // Create users
    const createdUsers = [];
    for (const user of users) {      
      // Create user
      const createdUser = await User.create({
        ...user
      });
      
      createdUsers.push({
        ...user,
        _id: createdUser._id
      });
    }
    
    console.log(`${createdUsers.length} users created`);
    
    // Generate and insert stocks
    const stocks = generateStocks(createdUsers);
    await Stock.insertMany(stocks);
    
    console.log(`${stocks.length} stocks created`);
    
    console.log('Sample data inserted successfully');
    console.log('You can now use these test accounts:');
    createdUsers.forEach(user => {
      console.log(`- Login: ${user.login}, Password: password123, Cash Balance: $${user.cashBalance}`);
    });
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDB(); 