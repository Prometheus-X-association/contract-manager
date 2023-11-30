# Use Node.js version 18.15.0 as the base image
FROM node:18.15.0

# Install pnpm globally
RUN npm install -g pnpm

# Create a working directory inside the container
WORKDIR /app

# Copy package.json & pnpm-lock.yaml files to the working directory
COPY package.json ./
COPY pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install

# Copy the rest of the app files to the working directory
COPY . .

# Compile TypeScript code
RUN pnpm build

CMD ["pnpm", "start"]
