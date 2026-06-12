FROM node:18-alpine

WORKDIR /app

# Copy package configurations
COPY package*.json ./

# Install packages bypassing peer dependencies issues (React 19)
RUN npm install --legacy-peer-deps

# Copy workspace
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Run Next.js server
CMD ["npm", "start"]
