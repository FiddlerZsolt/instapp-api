FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Create directories for logs and uploads if they don't exist
RUN mkdir -p storage/logs storage/media storage/upload

# Command to run the application
CMD ["npm", "start"]