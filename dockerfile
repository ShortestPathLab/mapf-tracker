# Start with the official Bun image
FROM oven/bun:latest

# Set the working directory inside the container
WORKDIR /app

# Copy all of the application code
COPY . .

# Install dependencies
RUN bun install

ENV PORT=3000

# Expose the port your app runs on (e.g., 3000)
EXPOSE 3000

WORKDIR /app/server

# Define the command to start your app
CMD ["bun", "run", "dev"]
