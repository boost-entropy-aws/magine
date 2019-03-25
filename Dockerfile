FROM amazonlinux:latest

MAINTAINER Jonathan Kempf <kempfjj@protonmail.com>

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

# Create packages of imagemagick binaries
RUN exodus -v /usr/local/bin/magick -o /usr/local/bin/exodus-magick
RUN exodus -v /usr/local/bin/animate -o /usr/local/bin/exodus-animate
RUN exodus -v /usr/local/bin/compare -o /usr/local/bin/exodus-compare
RUN exodus -v /usr/local/bin/composite -o /usr/local/bin/exodus-composite
RUN exodus -v /usr/local/bin/conjure -o /usr/local/bin/exodus-conjure
RUN exodus -v /usr/local/bin/convert -o /usr/local/bin/exodus-convert
RUN exodus -v /usr/local/bin/display -o /usr/local/bin/exodus-display
RUN exodus -v /usr/local/bin/identify -o /usr/local/bin/exodus-identify
RUN exodus -v /usr/local/bin/import -o /usr/local/bin/exodus-import
RUN exodus -v /usr/local/bin/mogrify -o /usr/local/bin/exodus-mogrify
RUN exodus -v /usr/local/bin/montage -o /usr/local/bin/exodus-montage
RUN exodus -v /usr/local/bin/stream -o /usr/local/bin/exodus-stream

# Create packages of libwebp binaries
RUN exodus -v /usr/local/bin/cwebp -o /usr/local/bin/exodus-cwebp
RUN exodus -v /usr/local/bin/dwebp -o /usr/local/bin/exodus-dwebp
