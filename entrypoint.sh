#!/bin/bash
set -e

docker-compose up -d
# Start Nginx in the foreground
nginx -g "daemon off;" &

# Start your Node.js application
node build/app.js