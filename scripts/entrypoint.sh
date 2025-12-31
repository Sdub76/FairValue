
#!/bin/sh

# 1. Config Management
# Check if /config volume is mounted and empty/missing config
if [ -d "/config" ]; then
    if [ ! -f "/config/config.yaml" ]; then
        echo "[Entrypoint] No config.yaml found in /config. Creating default from template..."
        cp /app/config/config.template.yaml /config/config.yaml
    else
        echo "[Entrypoint] Found existing config.yaml in /config."
    fi
    # Set config path for app
    export CONFIG_FILE_PATH="/config/config.yaml"
else
    echo "[Entrypoint] /config volume not found. Using local dev config."
    # App defaults to ./config/config.yaml
fi

# 2. Start PocketBase
echo "[Entrypoint] Starting PocketBase..."
/usr/local/bin/pocketbase serve --http=0.0.0.0:8090 --dir=/pb_data &
PB_PID=$!

# Wait for PB to be ready
echo "[Entrypoint] Waiting for PocketBase to be ready..."
until curl -s http://127.0.0.1:8090/api/health > /dev/null; do
    sleep 1
done
echo "[Entrypoint] PocketBase is ready."

# 3. Initialize Database (Schema & Seeds)
echo "[Entrypoint] Running Database Initialization..."
# We explicitly run the initialization script. 
# Note: For a robust setup, I'd recommend ensuring setup_schema is fully JS or transpiled. 
# For this immediate fix, I'm relying on init_db.mjs which handles baseline seeding.
# The user might need to run full schema setup manually if init_db.mjs is limited.
# BUT, to match user request "Initialize with valuation training data", we try our best.
node scripts/init_db.mjs

# 4. Start Next.js App
echo "[Entrypoint] Starting Next.js..."
# Pass signals to the node process?
npm run dev &
NEXT_PID=$!

# Wait for processes
wait $NEXT_PID
