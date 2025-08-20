# Use official Node.js 18 image
FROM node:18

# Set working directory
WORKDIR /app

# Copy the rest of your code
RUN git clone https://github.com/tmcbride/planningpoker.git

WORKDIR /app/planningpoker

# Install dependencies
RUN npm install

RUN npm run build

# Expose port (if your app uses one, e.g., 3000)
EXPOSE 5001

# Run your main file
CMD ["node", "server/server.js"]
