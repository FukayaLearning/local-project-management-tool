FROM mcr.microsoft.com/playwright:v1.49.1-jammy

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy configuration and scripts
COPY . .

# Set entrypoint to run tests
CMD ["npx", "playwright", "test"]
