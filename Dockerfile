# Stage 1: Build the application
FROM node:lts-buster-slim AS build

# Create app directory
WORKDIR /usr/src/app

COPY package.json /usr/src/app/package.json
COPY package-lock.json /usr/src/app/package-lock.json
RUN npm ci

# Copy TypeScript source code
COPY . /usr/src/app

# Build the TypeScript code
RUN npm run build

# Stage 2: Run the application
FROM node:lts-buster-slim AS production

# Create app directory
WORKDIR /usr/src/app

# Copy the built JavaScript code from the previous stage
COPY --from=build /usr/src/app/build /usr/src/app

EXPOSE 3000

CMD [ "node", "index.js" ]
