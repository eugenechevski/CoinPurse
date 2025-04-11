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

### Automated Deployment with GitHub Actions

The application is automatically deployed to AWS Lightsail when changes are pushed to the main branch through GitHub Actions. The deployment workflow:

1. Builds the React frontend
2. Packages the backend and frontend files
3. Securely transfers files to the server using SSH
4. Installs dependencies
5. Starts the application using PM2

### Server Architecture

The production environment uses:

- **AWS Lightsail** as the hosting platform
- **Bitnami Node.js** stack
- **Apache** as a reverse proxy to route traffic
- **PM2** for process management

### Frontend Build and Serving

The frontend build process works as follows:

1. **Build Generation**: During the GitHub Actions workflow, the frontend is built using:
   ```bash
   cd front-end
   npm run build
   ```
   This generates optimized production files in the `dist/` directory using Vite's build process.

2. **File Transfer**: The built files are transferred to the server:
   ```bash
   scp -r front-end/dist $USER@$SERVER:/opt/bitnami/projects/coinpurse/front-end/
   ```

3. **Static File Serving**: In production, the built frontend is served using the `serve` package:
   ```bash
   # Command used to serve the static files
   serve -s dist
   ```
   This lightweight static file server handles:
   - Serving the optimized assets (JS, CSS, images)
   - SPA routing (redirecting all routes to index.html)
   - Proper MIME types and caching headers

4. **Process Management**: PM2 manages the frontend server process:
   ```javascript
   // From ecosystem.config.js
   {
     name: "coinpurse-front",
     cwd: "../front-end",
     script: "npm",
     args: "run serve",  // Runs: serve -s dist
     // ... other configuration
   }
   ```

5. **Apache Integration**: Apache forwards non-API requests to the frontend server:
   ```apache
   # API requests go to the backend
   ProxyPass /api/ http://localhost:5001/api/
   ProxyPassReverse /api/ http://localhost:5001/api/
   
   # Everything else goes to the frontend
   ProxyPass / http://localhost:3000/
   ProxyPassReverse / http://localhost:3000/
   ```

This setup provides several benefits:
- Built files are optimized for production (minified, code-split, tree-shaken)
- Static file serving is fast and efficient
- Client-side routing works smoothly with the SPA architecture
- Changes to the frontend can be deployed without restarting the backend

### PM2 Process Management

PM2 is used to manage both the backend and frontend processes:

```bash
# Structure of ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "coinpurse-api",  // Backend API service
      script: "npm",
      args: "run prod",
      instances: 1,
      autorestart: true,
      watch: true,
      env: {
        NODE_ENV: "production",
        PORT: 5001,
      },
    },
    {
      name: "coinpurse-front", // Frontend static server
      cwd: "../front-end",
      script: "npm",
      args: "run serve",
      instances: 1,
      autorestart: true,
      watch: true,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
```

### Apache Reverse Proxy Configuration

Apache routes traffic to the appropriate service:
- API requests (`/api/*`) are routed to the backend service on port 5001
- All other requests are served by the frontend on port 3000

### Managing the Deployed Application

To manage the application on the server:

```bash
# SSH into the server
ssh bitnami@your-server-ip

# Navigate to the backend directory
cd /opt/bitnami/projects/coinpurse/back-end

# View running processes
pm2 list

# View logs
pm2 logs

# Restart services
pm2 restart all

# Stop services
npm run stop  # or: pm2 stop all

# Start services
npm run start  # or: pm2 start ecosystem.config.js
```

### Testing the API

To test if the API is running properly:

```bash
# From the server
curl http://localhost:5001

# From anywhere (using domain)
curl https://coinpurse.oosclass.baby/api
```

The API should return a JSON response like:
```json
{
  "message": "Welcome to CoinPurse API",
  "environment": "production",
  "isProduction": true
}
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.