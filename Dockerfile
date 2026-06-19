FROM node:18-alpine
WORKDIR /app

# Copy root and backend package configuration files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Copy prisma schema so that root postinstall (prisma generate) succeeds
COPY backend/prisma/ ./backend/prisma/

# Install dependencies for both root and backend
RUN npm install
RUN npm install --prefix backend

# Copy the rest of the backend source files
COPY backend/ ./backend/

# Configure production environment variables and port exposure
ENV NODE_ENV=production
ENV PORT=7860
EXPOSE 7860

# Run the Express server
WORKDIR /app/backend
CMD ["npm", "start"]
