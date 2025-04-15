# CoinPurse API Documentation

## Overview

CoinPurse is a stock portfolio management API that allows users to create accounts, manage their cash balance, buy and sell stocks, and track their investments. The API integrates with Finnhub to fetch real-time stock quotes.

## Technology Stack

- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **MongoDB**: Database (connected via configuration)
- **Authentication**: Custom user authentication system
- **External API**: Finnhub for stock market data

## Configuration

The application loads its configuration from `./src/config/config.js` which includes:

- Environment settings (`NODE_ENV`)
- Production mode flag (`isProduction`)
- Port number (`PORT`)
- Finnhub API key (`FINNHUB_API_KEY`)

## Database Models

### User Model

- `userID`: Unique identifier for the user
- `login`: Username for authentication
- `password`: Hashed password (with bcrypt comparison method)
- `firstName`: User's first name
- `lastName`: User's last name
- `email`: User's email address
- `cashBalance`: User's available funds for trading

### Stock Model

- `userID`: Reference to the user who owns the stock
- `symbol`: Stock ticker symbol
- `moneyInvested`: Total amount invested in this stock
- `unitsOwned`: Number of shares owned
- `companyName`: Name of the company (currently defaults to "Unknown")
- `sector`: Industry sector (currently defaults to "Unknown")
- `purchaseHistory`: Array of transactions with date, price, and units

## API Endpoints

### Authentication

#### Test Connection

- **Endpoint**: `GET /api/test`
- **Description**: Simple test endpoint to verify API connectivity
- **Response**:
  ```json
  {
    "message": "Welcome to CoinPurse API",
    "environment": "[current environment]",
    "isProduction": true/false
  }
  ```

#### Login

- **Endpoint**: `POST /api/auth/login`
- **Description**: Authenticates a user and returns their profile information
- **Request Body**:
  ```json
  {
    "login": "username",
    "password": "user_password"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Login successful",
    "userID": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "cashBalance": 1000.0
  }
  ```
- **Error Responses**:
  - 400: Login and password required
  - 401: Invalid login or password
  - 500: Server error

#### Register User

- **Endpoint**: `POST /api/auth/addUser`
- **Description**: Creates a new user account
- **Request Body**:
  ```json
  {
    "login": "username",
    "password": "user_password",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "message": "user created successfully",
    "userID": "user_id"
  }
  ```
- **Error Responses**:
  - 400: Missing required fields, or duplicate email/login
  - 500: Server error

#### Remove User

- **Endpoint**: `POST /api/auth/removeUser`
- **Description**: Deletes a user account and all associated stocks
- **Request Body**:
  ```json
  {
    "userID": "user_id"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User and associated Stocks deleted successfully"
  }
  ```
- **Error Responses**:
  - 400: Missing userID
  - 404: User not found
  - 500: Server error

#### Update Balance

- **Endpoint**: `POST /api/auth/updateBalance`
- **Description**: Deposits or withdraws money from a user's cash balance
- **Request Body**:
  ```json
  {
    "userID": "user_id",
    "transactionAmount": 100.0 // Positive for deposit, negative for withdrawal
  }
  ```
- **Response**:
  ```json
  {
    "message": "User balance updated successfully",
    "newBalance": 1100.0
  }
  ```
- **Error Responses**:
  - 400: Missing required fields
  - 404: User not found
  - 500: Server error

#### Logout

- **Endpoint**: `POST /api/auth/logout`
- **Description**: Ends a user session (currently a placeholder endpoint)
- **Response**:
  ```json
  {
    "message": "Logout successful"
  }
  ```

### Stock Management

#### Get Stock Quote

- **Endpoint**: `GET /api/quote/:symbol`
- **Description**: Fetches current price information for a stock symbol from Finnhub
- **URL Parameters**:
  - `symbol`: Stock ticker symbol (e.g., AAPL)
- **Response**: Finnhub quote data
- **Error Responses**:
  - 500: Error fetching stock quote

#### Update Stock Position

- **Endpoint**: `POST /api/stocks/update`
- **Description**: Buys or sells shares of a stock
- **Request Body**:
  ```json
  {
    "userID": "user_id",
    "symbol": "AAPL",
    "action": "buy", // or "sell"
    "units": 10,
    "price": 150.0
  }
  ```
- **Response**:
  ```json
  {
    "message": "Successfully updated stock position",
    "stock": {
      // Stock object details
    },
    "user": {
      // User object details
    }
  }
  ```
- **Error Responses**:
  - 400: Missing fields, insufficient funds, not enough units to sell, or invalid action
  - 404: User not found
  - 500: Server error

#### Search Portfolio

- **Endpoint**: `POST /api/auth/searchPortfolio`
- **Description**: Checks if a user owns a specific stock and returns position details
- **Request Body**:
  ```json
  {
    "userID": "user_id",
    "symbol": "AAPL"
  }
  ```
- **Response**:
  ```json
  {
    "moneyInvested": 1500.0,
    "unitsOwned": 10,
    "purchaseHistory": [
      // Array of purchase/sale transactions
    ]
  }
  ```
- **Error Responses**:
  - 400: Missing required fields
  - 404: Invalid userID
  - 500: Server error

#### Search New Stock

- **Endpoint**: `POST /api/auth/searchNewStock`
- **Description**: Searches for stocks by name or symbol using Finnhub
- **Request Body**:
  ```json
  {
    "query": "apple"
  }
  ```
- **Response**: Finnhub search results
- **Error Responses**:
  - 500: Server error

## Error Handling

The API includes a global error handler middleware that catches unhandled errors and returns a 500 status code with a generic error message.

## Server Configuration

The server runs on the port specified in the configuration file and logs the current environment mode and port number on startup.

## Implementation Notes

1. Passwords are compared using bcrypt via a method on the User model
2. User IDs are generated using the current timestamp and a random number
3. Stock purchases and sales update the user's cash balance accordingly
4. When selling stocks, the average purchase price is used to recalculate the money invested
5. Purchase history tracks both buys (positive units) and sells (negative units)
