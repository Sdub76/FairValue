FROM node:20-alpine

# Install utilities
RUN apk add --no-cache git curl unzip

# Download and install Pocketbase
RUN curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.23.4/pocketbase_0.23.4_linux_amd64.zip -o /tmp/pb.zip && \
    unzip /tmp/pb.zip -d /usr/local/bin/ && \
    rm /tmp/pb.zip

WORKDIR /app

# Set default Environment Variables
ENV NODE_ENV=production
ENV NEXT_PUBLIC_POCKETBASE_URL=/pb
ENV POCKETBASE_INTERNAL_URL=http://127.0.0.1:8090
ENV CONFIG_FILE_PATH=/config/config.yaml
ENV PB_ADMIN_EMAIL=admin@fairvalue.app
ENV PB_ADMIN_PASSWORD=1234567890

# The entrypoint will be handled by the compose command or script
# but we can set a default
# Copy and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy application source
COPY . .

# Copy config template
COPY config/config.template.yaml /app/config/config.template.yaml

COPY scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

CMD ["/usr/local/bin/entrypoint.sh"]
