# Use official lightweight Node.js 18 image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose port (Hugging Face Spaces default port)
EXPOSE 7860

# Define environment variables
ENV PORT=7860
ENV NODE_ENV=production

# Start the application
CMD ["node", "server.js"]
