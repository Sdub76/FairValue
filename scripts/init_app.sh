#!/bin/sh
# Build the image first
docker compose build app

# Run with --no-deps to avoid starting Pocketbase (which might have port conflicts right now)
docker compose run --rm --no-deps app sh -c "npx -y create-next-app@latest temp_init --typescript --tailwind --eslint --app --no-src-dir --import-alias '@/*' --use-npm && cp -a temp_init/. . && rm -rf temp_init"
