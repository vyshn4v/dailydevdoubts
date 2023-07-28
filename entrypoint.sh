#!/bin/bash
set -e


# Start Nginx in the foreground
nginx -g "daemon off;" &

# Start your Node.js application
node build/app.js