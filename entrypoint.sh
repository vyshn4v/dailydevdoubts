#!/bin/bash
set -e

# Start MongoDB as a background service
mongod --fork --logpath /var/log/mongodb.log

# Start Nginx in the foreground
nginx -g "daemon off;" &

# Start your Node.js application
node build/app.js