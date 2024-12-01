# Stage 1: Build the app
FROM node:18-alpine as build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Stage 2: Create final image
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm install --only=production

# Copy app code from the build stage
COPY --from=build /app /app

# Expose the port the app will run on
EXPOSE 8080

# Command to run the app
CMD ["npm", "run", "start"]
