# Use official Node.js LTS version as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy only package files first (leverages Docker cache for faster builds)
COPY package*.json ./

# Clean .cache directory and install dependencies
RUN rm -rf /app/node_modules/.cache && npm ci --omit=dev

# Copy the rest of your application code
COPY . .

# Expose your app's listening port (adjust if not 3000)
EXPOSE 3000

# Start your app
CMD [ "npm", "start" ]
