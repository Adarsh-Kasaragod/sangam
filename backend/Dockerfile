FROM php:8.1-cli

# Install PDO MySQL extension
RUN docker-php-ext-install pdo pdo_mysql

# Copy backend files
COPY . /app
WORKDIR /app

# Expose the port Render provides via $PORT
EXPOSE 10000

# Start PHP's built-in server on the port Render assigns
CMD php -S 0.0.0.0:${PORT:-10000} -t .
