FROM node:18-slim

# Install necessary dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    libx11-dev \
    libxcomposite-dev \
    libxrandr-dev \
    libgtk-3-dev \
    libnss3 \
    libasound2 \
    libxss1 \
    libxtst6 \
    fonts-liberation \
    && apt-get clean

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN npm install

# Create captures folder
RUN mkdir -p captures

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
