const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const config = require('./config/config');
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

// Routes
// TODO: Add routes here
const User = require('./models/User');
const Stock = require('./models/Stock');

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to CoinPurse API', 
    environment: config.NODE_ENV,
    isProduction: config.isProduction
  });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  // incoming: login, password
  // outgoing: message, userID, firstName, lastName, cashBalance
  const { login, password } = req.body;

  // verify fields are filled
  if (!login || !password) {
    return res.status(400).json({ error: 'Login and password required' });
  }

  // attempt login
  try {
    const user = await User.findOne({ login, password });

    if (!user) {
      return res.status(401).json({ error: 'Invalid login or password' });
    }

    // bcrypt for password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid login or password' });
    }
    // if user is found, return their info
    res.json({
      message: 'Login successful',
      userID: user.userID,
      firstName: user.firstName,
      lastName: user.lastName,
      cashBalance: user.cashBalance
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Update stocks on dashboard (get quotes from Finnhub)
app.get('/api/quote/:symbol', async (req, res) => {

  // make sure symbol is uppercase
  const symbol = req.params.symbol.toUpperCase();
  const apiKey = config.FINNHUB_API_KEY

  try {
    // get quote data from finnhub
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching stock quote' });
  }
});

// Update position in stock (buy/sell)
app.post('/api/stocks/update', async(req, res) => {
  // request fields
  const { userID, symbol, action, units, price } = req.body;

  // data check
  if (!userID || !symbol || !action || !units || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // verify user exists
    const user = await User.findOne({ userID });
    if (!user) {
      return res.status(404).json({ error: 'User not found'});
    }

    // calculate money being moved
    const totalAmount = price*units;

    // query the stock we're buying/selling
    let stock = await Stock.findOne({ userID, symbol });

    // buy action
    if (action === 'buy') {
      // check if they have enough money to buy
      if (user.cashBalance < totalAmount) {
        return res.status(400).json({error: 'Insufficient funds'});
      }

      // check if they already own the stock
      if (!stock) {
        // if they don't already own it, create a new one
        // TODO: Do we need to keep track of company name and sector here?
        stock = new Stock({
          userID,
          symbol,
          moneyInvested: totalAmount,
          unitsOwned: units,
          companyName: 'Unknown',
          sector: 'Unknown',
          purchaseHistory: [{date: new Date(), price, units }]
        });
      } else {
        // if they already own it, update existing stock
        stock.moneyInvested += totalAmount;
        stock.unitsOwned += units;
        stock.purchaseHistory.push({date: new Date(), price, units });
      }

      // update cash balance to reflect purchase
      user.cashBalance -= totalAmount;

    } else if (action === 'sell') {
      //check if they actually own the stock/enough units
      if (!stock || stock.unitsOwned < units) {
        return res.status(400).json({ error: 'Not enough units to sell' });
      }

      // recalculate investment and cash
      const avgPrice = stock.moneyInvested / stock.unitsOwned;
      stock.unitsOwned -= units;
      stock.moneyInvested -= avgPrice * units;

      user.cashBalance += totalAmount;
      stock.purchaseHistory.push({ date: new Date(), price: -price, units: -units });
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    //awaits
    await stock.save();
    await user.save();

    // add success message
    res.json({ message: `Successfully updated stock position`, stock, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
}); 
