const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const config = require('./config/config');
const connectDB = require('./config/db');

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

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to CoinPurse API', 
    environment: config.NODE_ENV,
    isProduction: config.isProduction
  });
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


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
}); 
