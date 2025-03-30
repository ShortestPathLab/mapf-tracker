# Start with the official Bun image
FROM oven/bun:debian

# Install make and build essentials
RUN apt-get update && apt-get install -y build-essential

# Verify make is installed
RUN make --version

# Set the working directory inside the container
WORKDIR /app

# Copy packages
# This _will_ mean docker will invalidate layer after _any_ change to packages 
COPY packages packages

# Copy package.json
COPY package.json bun.lock ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json

# Install dependencies
RUN bun install

# Copy all files
COPY . .

# ─── Setup Mail ───────────────────────────────────────────────────────────────

RUN apt-get update && apt-get upgrade -y

RUN apt-get install -y mailutils ssmtp

RUN echo 'mailhub=host.docker.internal' >> /etc/ssmtp/ssmtp.conf
RUN echo 'FromLineOverride=YES' >> /etc/ssmtp/ssmtp.conf

# ──────────────────────────────────────────────────────────────────────────────

ENV PORT=80

EXPOSE 80

WORKDIR /app/server

# Define the command to start your app
CMD ["bun", "start", "--env-file=.env.production"]
