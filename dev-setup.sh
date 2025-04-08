#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up CoinPurse local development environment...${NC}"

# Install backend dependencies if node_modules doesn't exist
if [ ! -d "/Users/eugenechevski/Desktop/CoinPurse/back-end/node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd /Users/eugenechevski/Desktop/CoinPurse/back-end
    npm install
fi

# Install frontend dependencies if node_modules doesn't exist
if [ ! -d "/Users/eugenechevski/Desktop/CoinPurse/front-end/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd /Users/eugenechevski/Desktop/CoinPurse/front-end
    npm install
fi

# Check if MongoDB is installed
if command -v mongod &> /dev/null; then
    echo -e "${GREEN}MongoDB is installed.${NC}"
else
    echo -e "${RED}MongoDB is not installed.${NC}"
    echo -e "${YELLOW}Please install MongoDB first:${NC}"
    echo -e "macOS: brew install mongodb-community"
    echo -e "Ubuntu: sudo apt install mongodb"
    exit 1
fi

# Check if MongoDB is running
if pgrep -x "mongod" > /dev/null; then
    echo -e "${GREEN}MongoDB is already running.${NC}"
else
    echo -e "${YELLOW}Starting MongoDB...${NC}"
    # For macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start mongodb-community || mongod --config /usr/local/etc/mongod.conf --fork
    # For Linux
    else
        sudo systemctl start mongodb || sudo service mongodb start
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}MongoDB started successfully.${NC}"
    else
        echo -e "${RED}Failed to start MongoDB. Please start it manually.${NC}"
        exit 1
    fi
fi

# Initialize MongoDB with test data
echo -e "${YELLOW}Initializing MongoDB with test data...${NC}"
mongosh --eval "db.getSiblingDB('coinpurse').dropDatabase()" || mongosh --eval "db.getSiblingDB('coinpurse').dropDatabase()"
cd /Users/eugenechevski/Desktop/CoinPurse/back-end && NODE_ENV=development node utils/seed-db.js

echo -e "${GREEN}Development environment setup complete!${NC}"