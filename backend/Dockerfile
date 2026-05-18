FROM php:8.4-apache

# Install system dependencies and PHP extensions for PostgreSQL
RUN apt-get update && apt-get install -y \
    libpq-dev \
    zip \
    unzip \
    git \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-install pdo pdo_pgsql pgsql gd mbstring xml

# Enable Apache rewrite module
RUN a2enmod rewrite

# Change Apache document root to Laravel /public
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy all application files
COPY . .

# Create env file from example
RUN cp .env.example .env

# Install Laravel dependencies
RUN composer install --no-interaction --optimize-autoloader --no-dev --ignore-platform-reqs

# Set permissions for storage and bootstrap/cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Expose port 80
EXPOSE 80

# Dynamically adjust Apache to listen to the port provided by Render ($PORT)
CMD sed -i "s/Listen 80/Listen ${PORT:-80}/g" /etc/apache2/ports.conf && \
    sed -i "s/<VirtualHost \*:80>/<VirtualHost \*:${PORT:-80}>/g" /etc/apache2/sites-available/*.conf && \
    apache2-foreground
