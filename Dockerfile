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
RUN npm run build

# Define env variable related to the server
ENV CONTRAT_MODEL_PATH="data/contract-model.json"
ENV MONGO_URL="mongodb://127.0.0.1:27017"
ENV SERVER_PORT="8888"

CMD ["pnpm", "start"]
