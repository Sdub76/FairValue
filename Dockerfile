FROM node:20-alpine

WORKDIR /app

# Install git and other utilities useful for dev
RUN apk add --no-cache git curl

# We don't copy files here because we bind mount the volume for development
# This ensures we are editing the files on the host (SMB Share)
