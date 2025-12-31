#!/bin/sh

# Start Pocketbase in the background
echo "Starting Pocketbase..."
/usr/local/bin/pocketbase serve --http=0.0.0.0:8090 --dir=/pb_data &
PB_PID=$!

# Wait for PB to be ready (naive check)
sleep 2

# Start Next.js
echo "Starting Next.js..."
npm run dev

# If npm run dev exits, kill PB
kill $PB_PID
