FROM mcr.microsoft.com/playwright:v1.58.2-jammy

WORKDIR /app

# Install git and docker cli
RUN apt-get update && apt-get install -y git docker.io docker-compose-v2 && rm -rf /var/lib/apt/lists/*

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy configuration and scripts
COPY scripts/ ./scripts/
COPY package.json ./

# Set entrypoint to run tests
CMD ["npx", "playwright", "test", "-c", "scripts/playwright.config.ts"]
