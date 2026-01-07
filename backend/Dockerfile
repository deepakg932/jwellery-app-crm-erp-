# Base image
FROM node:20-alpine

# App directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production deps
RUN npm install --production

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start app
CMD ["node", "server.js"]
