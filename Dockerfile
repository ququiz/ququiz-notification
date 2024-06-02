# Base image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Copy .env file
# COPY .env ./

# Default command to run when container starts
# Tunggu 30 detik, nunggu RabbitMQ
CMD ["sh", "-c", "sleep 30 && node main.js"]