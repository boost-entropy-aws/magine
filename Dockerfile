FROM amazonlinux:latest

MAINTAINER Jonathan Kempf <kempfjj@protonmail.com>

WORKDIR /

RUN yum -y install tar \
    zip \
    gzip \
    wget \
    gcc \
    make \
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    libgif-dev
RUN yum clean all

# Download image dependencies
RUN wget https://storage.googleapis.com/downloads.webmproject.org/releases/webp/libwebp-1.0.1.tar.gz
RUN wget https://imagemagick.org/download/ImageMagick.tar.gz

# Install image dependencies
RUN tar -xzvf libwebp-1.0.1.tar.gz
RUN tar -xzvf ImageMagick.tar.gz
# Unpack dependencies
RUN cd libwebp-1.0.1 \
    && ./configure \
    && make \
    && make install

ARG imagemagickVersion
RUN cd ImageMagick-$imagemagickVersion \
    && ./configure --with-webp \
    && make \
    && make install

# Remove tar files
RUN rm libwebp-1.0.1.tar.gz
RUN rm ImageMagick.tar.gz

# pip installation
RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
RUN python get-pip.py

# Exodus installation
RUN pip install --user exodus-bundler
ENV PATH="~/.local/bin/:${PATH}"

# Create packages of imagemagick binary
RUN exodus -t /usr/local/bin/magick -o /usr/local/bin/exodus-magick.tgz
