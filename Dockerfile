# Use the official Node.js 20 image
FROM node:20-slim

# Create and define the application directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of your bot code
COPY . .

# Expose port 8000 for your Express web server (UptimeRobot)
EXPOSE 8000

# Start the bot
CMD [ "node", "your_filename.js" ]
