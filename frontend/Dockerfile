# frontend/Dockerfile

# Step 1: Build the React app
FROM node:18 as builder

WORKDIR /app
COPY . /app
RUN node -v  # Check Node.js version
RUN npm install && npm run build

# Step 2: Serve the app using Node
FROM node:18
WORKDIR /app
COPY --from=builder /app/build /app/build
COPY package*.json ./
RUN node -v  # Check Node.js version
RUN npm install -g serve && serve --version

# Serve the build directory
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
EXPOSE 3000