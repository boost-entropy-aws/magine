FROM amazonlinux:latest

MAINTAINER Jonathan Kempf <kempfjj@protonmail.com>

WORKDIR /

RUN yum -y install tar \
    zip \
    gzip \
    wget \
    apt-get \
    gcc \
    make 
RUN yum clean all

# Download image dependencies
# TO DO - find where the fuck jpegs are
RUN wget https://sourceforge.net/projects/libjpeg-turbo/files/2.0.0/libjpeg-turbo-2.0.0.tar.gz
RUN wget http://ftp-osl.osuosl.org/pub/libpng/src/libpng16/libpng-1.6.34.tar.gz
RUN wget https://download.osgeo.org/libtiff/tiff-4.0.10.tar.gz
RUN wget https://sourceforge.net/projects/giflib/files/giflib-5.1.9.tar.gz
RUN wget https://storage.googleapis.com/downloads.webmproject.org/releases/webp/libwebp-1.0.1.tar.gz
RUN wget https://imagemagick.org/download/ImageMagick.tar.gz

# Install image dependencies
RUN tar -xzvf libjpeg-turbo-2.0.0.tar.gz
RUN tar -xzvf libpng-1.6.34.tar.gz
RUN tar -xzvf tiff-4.0.10.tar.gz
RUN tar -xzvf giflib-5.1.9.tar.gz
RUN tar -xzvf libwebp-1.0.1.tar.gz
RUN tar -xzvf ImageMagick.tar.gz
# Unpack dependencies
RUN cd libjpeg-turbo-2.0.0 \
    && ./configure \
    && make \
    && make install
RUN cd libpng-1.6.34 \
    && ./configure \
    && make \
    && make install
RUN cd tiff-4.0.10 \
    && ./configure \
    && make \
    && make install
RUN cd giflib-5.1.9 \
    && ./configure \
    && make \
    && make install
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
