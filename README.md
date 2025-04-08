# CoinPurse

A web application for tracking your investment portfolio.

## Features

- Add and track stocks in your portfolio
- View your portfolio in a table and chart format
- Track your cash balance
- Analyze your investments with real-time data

## Tech Stack

### Frontend
- React with TypeScript
- Vite for fast development
- TailwindCSS for styling
- React Router for navigation
- Chart.js for data visualization
- Formik and Yup for form validation
- Axios for API communication

### Backend
- Node.js with Express
- MongoDB with Mongoose
- RESTful API

### API Integrations
- Alpha Vantage for stock data
- Finnhub for real-time quotes
- TradingView for charts

## Project Structure

```
CoinPurse/
├── .github/           # GitHub Actions workflows
├── back-end/          # Express backend
│   ├── config/        # Configuration files
│   ├── controllers/   # API controllers
│   ├── middleware/    # Custom middleware
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   └── utils/         # Utility functions
├── front-end/         # React frontend
│   ├── public/        # Static assets
│   └── src/           # React source code
│       ├── assets/    # Images, styles, etc.
│       ├── components/# Reusable components
│       ├── context/   # React context providers
│       ├── hooks/     # Custom hooks
│       ├── pages/     # Page components
│       ├── services/  # API services
│       └── utils/     # Utility functions
```

## Environment Setup

The project is configured to run in different environments:

- **Development**: Uses local MongoDB instance
- **Production**: Uses MongoDB Atlas cloud instance

Each environment has its own configuration files:
- `.env` - Base configuration with common settings
- `.env.development` - Development environment settings
- `.env.production` - Production environment settings

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (v4+)
- API keys for Alpha Vantage and Finnhub

### Installation and Setup

#### Automatic Setup (Recommended)

1. Clone the repository
```bash
git clone https://github.com/eugenechevski/coinpurse.git
cd coinpurse
```

2. Make the setup script executable
```bash
chmod +x dev-setup.sh
```

3. Run the development setup script
```bash
./dev-setup.sh
```

This script will:
- Check for MongoDB installation and start it if needed
- Initialize the database with sample test data
- Install dependencies for both backend and frontend
- Start the backend and frontend development servers

#### Manual Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/coinpurse.git
cd coinpurse
```

2. Install backend dependencies
```bash
cd back-end
npm install
```

3. Install frontend dependencies
```bash
cd ../front-end
npm install
```

4. Ensure MongoDB is running locally
```bash
# macOS
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongodb
```

5. Seed the database with sample data
```bash
cd back-end
npm run seed:dev  # For development environment
```

6. Start the backend server
```bash
npm run dev  # For development environment
npm run prod # For production environment
```

7. In a new terminal, start the frontend development server
```bash
cd ../front-end
npm run dev
```

8. Access the application at http://localhost:3000

### Sample Test Data

After running the database seed script, you'll have access to the following test accounts:

- **Test User**
  - Login: testuser
  - Password: password123
  - Cash Balance: $10,000.00
  - Stocks: AAPL, MSFT, TSLA

- **John Smith**
  - Login: johnsmith
  - Password: password123
  - Cash Balance: $25,000.00
  - Stocks: AMZN, GOOGL

- **Jane Doe**
  - Login: janedoe
  - Password: password123
  - Cash Balance: $15,000.00
  - Stocks: NFLX, DIS, SBUX

### Local Database

The application is configured to use a local MongoDB instance for development. The connection string is set in the `.env.development` file:

```
MONGODB_URI=mongodb://localhost:27017/coinpurse
```

For production, the MongoDB Atlas connection string is set in the `.env.production` file:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/coinpurse?retryWrites=true&w=majority
```

To reset the database with fresh test data:

```bash
# For development environment
npm run seed:dev

# For production environment (be careful!)
npm run seed:prod
```

## Deployment

The application is automatically deployed to AWS Lightsail when changes are pushed to the main branch through GitHub Actions.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
