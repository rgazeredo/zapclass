FROM php:8.3-fpm

# Dependências do sistema
RUN apt-get update && apt-get install -y \
    build-essential \
    libpng-dev \
    libjpeg-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    curl \
    git \
    libpq-dev \
    nodejs \
    npm \
    supervisor \
    cron \
    && docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd opcache

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copiar configurações do PHP-FPM e PHP
COPY php-fpm/www.conf /usr/local/etc/php-fpm.d/www.conf
COPY php-fpm/php.ini /usr/local/etc/php/conf.d/custom.ini

COPY . .

RUN composer install
RUN npm cache clean --force && npm install && npm run build

CMD ["php-fpm"]
