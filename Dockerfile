FROM php:7.4-apache

WORKDIR /var/www/html

RUN apt-get -y update --fix-missing

# Install valgrind
RUN apt-get -y install valgrind

COPY . .

VOLUME "/var/www/html/data"

RUN chown -R www-data:www-data . \
    && a2enmod rewrite
