FROM node:20-alpine

# Install utilities
RUN apk add --no-cache git curl unzip

# Download and install Pocketbase
RUN curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.23.4/pocketbase_0.23.4_linux_amd64.zip -o /tmp/pb.zip && \
    unzip /tmp/pb.zip -d /usr/local/bin/ && \
    rm /tmp/pb.zip

WORKDIR /app

# The entrypoint will be handled by the compose command or script
# but we can set a default
COPY scripts/start_dev.sh /usr/local/bin/start_dev.sh
RUN chmod +x /usr/local/bin/start_dev.sh

CMD ["/usr/local/bin/start_dev.sh"]
