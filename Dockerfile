FROM amazonlinux:latest

MAINTAINER Jonathan Kempf <kempfjj@protonmail.com>

WORKDIR /

# Add a local file for testing magick commands in the container
COPY abstract-art-background-1124092.jpg /usr/local/abstract-art-background-1124092.jpg

# Yummy
RUN yum -y install yum-utils
RUN yum-config-manager --add-repo https://www.nasm.us/nasm.repo \
    && yum-config-manager --enable nasm.repo
RUN yum -y install tar \
    zip \
    unzip \
    gzip \
    wget \
    gcc \
    gcc-c++ \
    python-devel \
    make \
    cmake \
    nasm
RUN yum -y install zlib-devel \
    libjpeg-devel \
    libpng-devel \
    libtiff-devel \
    libwebp-devel
RUN yum clean all

# Download image dependencies
RUN wget https://www.imagemagick.org/download/delegates/openjpeg-2.3.0.tar.gz
RUN wget https://www.imagemagick.org/download/delegates/libxml2-2.9.6.tar.gz
RUN wget https://www.imagemagick.org/download/ImageMagick.tar.gz

RUN tar -xzvf openjpeg-*.tar.gz
RUN tar -xzvf libxml2-*.tar.gz
RUN tar -xzvf ImageMagick.tar.gz

RUN cd openjpeg-* \
    && mkdir build \
    && cd build \
    && cmake -G"Unix Makefiles" .. \
    && make \
    && make install \
    && cp libopenjp2.pc /usr/share/pkgconfig/

RUN cd openjpeg-* \
    && mkdir build \
    && cd build \
    && cmake -G"Unix Makefiles" .. \
    && make \
    && make install \
    && cp libxml22.pc /usr/share/pkgconfig/

RUN cd ImageMagick-* \
    && ./configure \
    && make \
    && make install

# Checks
RUN /usr/local/bin/magick -list format | grep -i "^[[:space:]]*jpeg"
RUN /usr/local/bin/magick -list format | grep -i "^[[:space:]]*jp2"
RUN /usr/local/bin/magick -list format | grep -i "^[[:space:]]*png"
RUN /usr/local/bin/magick -list format | grep -i "^[[:space:]]*tiff"
RUN /usr/local/bin/magick -list format | grep -i "^[[:space:]]*webp"

# Remove tar files
RUN rm openjpeg-*.tar.gz
RUN rm libxml2-*.tar.gz
RUN rm ImageMagick.tar.gz

# pip installation
RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
RUN python get-pip.py

# Exodus installation
RUN pip install --user exodus-bundler --no-warn-script-location
ENV PATH="~/.local/bin/:${PATH}"

# Create packages of imagemagick binary
RUN exodus -t /usr/local/bin/magick -o /usr/local/bin/exodus-magick.tgz
