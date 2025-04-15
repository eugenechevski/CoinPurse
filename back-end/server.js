const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const config = require("./src/config/config");
const connectDB = require("./src/config/db");

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
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS",
  );
  next();
});

// Routes
// TODO: Add routes here
const User = require("./src/models/User");
const Stock = require("./src/models/Stock");

// Basic route for testing
app.get("/api/test", (req, res) => {
  res.json({
    message: "Welcome to CoinPurse API",
    environment: config.NODE_ENV,
    isProduction: config.isProduction,
  });
});

// Login
app.post("/api/auth/login", async (req, res) => {
  // incoming: login, password
  // outgoing: message, _id, firstName, lastName, cashBalance
  const { login, password } = req.body;

  // verify fields are filled
  if (!login || !password) {
    return res.status(400).json({ error: "Login and password required" });
  }

  // attempt login
  try {
    const user = await User.findOne({ login });

    if (!user) {
      return res.status(401).json({ error: "Invalid login or password" });
    }

    // bcrypt for password
    const isMatch = await user.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid login or password" });
    }
    // if user is found, return their info
    res.json({
      message: "Login successful",
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      cashBalance: user.cashBalance,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add User
app.post("/api/auth/addUser", async (req, res) => {
  try {
    // incoming: login, password, firstName, lastName, email
    // outgoing: message, _id
    const { login, password, firstName, lastName, email } = req.body;

    // verify fields are filled
    if (!login || !password || !firstName || !lastName || !email) {
      return res.status(400).json({
        error:
          "First Name, Last Name, Login, and Password are required to add a new user",
      });
    }

    const emailCheckUser = await User.findOne({ email });
    if (emailCheckUser) {
      return res.status(400).json({ error: "Already a user with that email" });
    }

    const loginCheckUser = await User.findOne({ login });
    if (loginCheckUser) {
      return res.status(400).json({ error: "Already a user with that login" });
    }

    // Create new User and return
    const newUser = await User.create({
      login,
      password,
      firstName,
      lastName,
      email,
    });

    res.json({
      message: "user created successfully",
      _id: newUser._id,
    });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Remove User
app.post("/api/auth/removeUser", async (req, res) => {
  try {
    // can change to be based on login and password

    // incoming: _id
    // outgoing: message
    const { _id } = req.body;

    // verify fields are filled
    if (!_id) {
      return res.status(400).json({ error: "_id is required to remove user" });
    }

    const deletedUser = await User.findById(_id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    await User.findByIdAndDelete(_id);
    await Stock.deleteMany({ userId: _id });

    res
      .status(200)
      .json({ message: "User and associated Stocks deleted successfully" });
  } catch (error) {
    console.error("Error removing user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update User Balance
app.post("/api/auth/updateBalance", async (req, res) => {
  try {
    // incoming: _id, deposit / withdrawal amount
    // outgoing: message
    const { _id, transactionAmount } = req.body;

    // verify fields are filled
    if (!_id || !transactionAmount) {
      return res.status(400).json({
        error: "_id and transaction amount are required to update cash balance",
      });
    }

    let user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.cashBalance = user.cashBalance + transactionAmount;
    await user.save();

    res.status(200).json({
      message: "User balance updated successfully",
      newBalance: user.cashBalance,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Logout
app.post("/api/auth/logout", (req, res) => {
  res.json({ message: "Logout successful" });
});

// Update stocks on dashboard (get quotes from Finnhub)
app.get("/api/quote/:symbol", async (req, res) => {
  // make sure symbol is uppercase
  const symbol = req.params.symbol.toUpperCase();
  const apiKey = config.FINNHUB_API_KEY;

  try {
    // get quote data from finnhub
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`,
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching stock quote" });
  }
});

// Update position in stock (buy/sell)
app.post("/api/stocks/update", async (req, res) => {
  // request fields
  const { _id, symbol, action, units, price } = req.body;

  // data check
  if (_id == null || symbol == null || action == null || units == null || price == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  

  try {
    // verify user exists
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // calculate money being moved
    const totalAmount = price * units;

    const mongoose = require('mongoose');
    const userId = typeof _id === 'string' ? new mongoose.Types.ObjectId(_id) : _id;
    let stock = await Stock.findOne({ userId: _id, symbol });




    // buy action
    if (action === "buy") {
      // check if they have enough money to buy
      if (user.cashBalance < totalAmount) {
        return res.status(400).json({ error: "Insufficient funds" });
      }

      // check if they already own the stock
      if (!stock) {
        // if they don't already own it, create a new one
        // TODO: Do we need to keep track of company name and sector here?
        stock = new Stock({
          userId: _id,
          symbol,
          moneyInvested: totalAmount,
          unitsOwned: units,
          companyName: "Unknown",
          sector: "Unknown",
          purchaseHistory: [{ date: new Date(), price, units }],
        });
        
      } else {
        // if they already own it, update existing stock
        stock.moneyInvested += totalAmount;
        stock.unitsOwned += units;
        stock.purchaseHistory.push({ date: new Date(), price, units });
      }

      // update cash balance to reflect purchase
      user.cashBalance -= totalAmount;
    } else if (action === "sell") {
      //check if they actually own the stock/enough units
      if (!stock || stock.unitsOwned < units) {
        return res.status(400).json({ error: "Not enough units to sell" });
      }

      // recalculate investment and cash
      const avgPrice = stock.moneyInvested / stock.unitsOwned;
      stock.unitsOwned -= units;
      stock.moneyInvested -= avgPrice * units;

      user.cashBalance += totalAmount;
      stock.purchaseHistory.push({
        date: new Date(),
        price: -price,
        units: -units,
      });
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    //awaits
    await stock.save();
    await user.save();

    // add success message
    res.json({ message: `Successfully updated stock position`, stock, user });
  } catch (err) {
    console.error("Error saving stock/user:", err.message);
    if (err.name === 'ValidationError') {
      for (const field in err.errors) {
        console.error(`Field: ${field} —`, err.errors[field].message);
      }
    }
    res.status(500).json({ error: err.message });
  }
  
});

// Search User's Portfolio for a Stock
app.post("/api/auth/searchPortfolio", async (req, res) => {
  try {
    // incoming: _id, symbol
    // outgoing: moneyInvested, unitsOwned, purchaseHistory

    const { _id, symbol } = req.body;

    if (!_id) {
      return res.status(400).json({ error: "Missing UserID" });
    }

    // verify user exists
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ error: "Invalid user ID" });
    }

    const stocks = await Stock.find({
      userId: _id,
      symbol: { $regex: symbol, $options: 'i' }
    });

    const result = stocks.map(stock => ({
      symbol: stock.symbol,
      moneyInvested: stock.moneyInvested,
      unitsOwned: stock.unitsOwned,
      purchaseHistory: stock.purchaseHistory
    }));

    // const result = {
    //   symbol: stock.symbol,
    //   moneyInvested: stock.moneyInvested,
    //   unitsOwned: stock.unitsOwned,
    //   purchaseHistory: stock.purchaseHistory
    // };

    return res.status(200).json(result);

  } catch (error) {
    console.error("Error searching for stock", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Search for a New Stock
// Search for a New Stock (US only)
app.post("/api/auth/searchNewStock", async (req, res) => {
  try {
    const { query } = req.body;
    const apiKey = config.FINNHUB_API_KEY;

    // Fetch US-listed stock symbols
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${apiKey}`
    );
    const allSymbols = await response.json();

    if (!allSymbols || !Array.isArray(allSymbols)) {
      return res.status(500).json({ error: "Invalid Finnhub response" });
    }

    const lowerQuery = query.toLowerCase();

    // Filter by symbol or company name match
    const filtered = allSymbols.filter(stock =>
      stock.symbol?.toLowerCase().includes(lowerQuery) ||
      stock.description?.toLowerCase().includes(lowerQuery)
    );

    // Limit result to top 10 matches (optional)
    res.json({ result: filtered.slice(0, 10) });
  } catch (error) {
    console.error("Error searching for US stock:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
});
