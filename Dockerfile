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
RUN yum -y install libpng-devel libwebp-devel zlib-devel
RUN yum clean all

# Download image dependencies
RUN wget http://www.imagemagick.org/download/delegates/LibRaw-0.18.5.tar.gz
RUN wget http://www.imagemagick.org/download/delegates/LibRaw-demosaic-pack-GPL3-0.18.5.tar.gz
RUN wget http://www.imagemagick.org/download/delegates/bzip2-1.0.6.tar.gz
# Maybe consider getting ffmpeg from delegates as well for gif+ support?
RUN wget http://www.imagemagick.org/download/delegates/freetype-2.8.1.tar.gz
RUN wget http://www.imagemagick.org/download/delegates/freetype-doc-2.8.1.tar.gz
RUN wget http://www.imagemagick.org/download/delegates/ghostpdl-9.15.tar.gz
RUN wget http://www.imagemagick.org/download/delegates/ghostscript-9.22.tar.gz
RUN wget http://www.imagemagick.org/download/delegates/ghostscript-fonts-std-8.11.tar.gz
RUN wget http://www.imagemagick.org/download/delegates/hp2xx-3.4.4.tar.gz
RUN wget http://www.imagemagick.org/download/delegates/jbigkit-2.1.tar.gz
RUN wget http://www.imagemagick.org/download/delegates/jpegsr9b.zip
RUN wget http://www.imagemagick.org/download/delegates/jpegsrc.v9b.tar.gz
RUN wget http://www.imagemagick.org/download/delegates/lcms2-2.8.tar.gz
RUN wget http://www.imagemagick.org/download/delegates/libfpx-1.3.1-10.tar.gz
# RUN wget http://www.imagemagick.org/download/delegates/libpng-1.6.31.tar.gz
# RUN wget http://www.imagemagick.org/download/delegates/libwebp-0.6.0.tar.gz
RUN wget http://www.imagemagick.org/download/delegates/libwmf-0.2.8.4.tar.gz
RUN wget http://www.imagemagick.org/download/delegates/libxml2-2.9.6.tar.gz
RUN wget http://www.imagemagick.org/download/delegates/mpeg2dec-0.2.0.tar.gz
RUN wget http://www.imagemagick.org/download/delegates/mpeg2vidcodec_v12.tar.gz
RUN wget http://www.imagemagick.org/download/delegates/openjpeg-2.3.0.tar.gz
RUN wget http://www.imagemagick.org/download/delegates/tiff-4.0.8.tar.gz
RUN wget http://www.imagemagick.org/download/delegates/trio-1.10.tar.gz
# RUN wget http://www.imagemagick.org/download/delegates/zlib-1.2.11.tar.gz
RUN wget https://imagemagick.org/download/ImageMagick.tar.gz

RUN tar -xzvf ImageMagick.tar.gz
RUN tar -xzvf freetype-2.8.1.tar.gz
RUN tar -xzvf freetype-doc-2.8.1.tar.gz
RUN tar -xzvf ghostpdl-9.15.tar.gz
RUN tar -xzvf ghostscript-9.22.tar.gz
RUN tar -xzvf ghostscript-fonts-std-8.11.tar.gz
RUN tar -xzvf hp2xx-3.4.4.tar.gz
RUN tar -xzvf jbigkit-2.1.tar.gz
RUN unzip jpegsr9b.zip
RUN tar -xzvf jpegsrc.v9b.tar.gz
RUN tar -xzvf lcms2-2.8.tar.gz
RUN tar -xzvf libfpx-1.3.1-10.tar.gz
# RUN tar -xzvf libpng-1.6.31.tar.gz
# RUN tar -xzvf libwebp-0.6.0.tar.gz
RUN tar -xzvf libwmf-0.2.8.4.tar.gz
RUN tar -xzvf libxml2-2.9.6.tar.gz
RUN tar -xzvf mpeg2dec-0.2.0.tar.gz
RUN tar -xzvf mpeg2vidcodec_v12.tar.gz
RUN tar -xzvf openjpeg-2.3.0.tar.gz
RUN tar -xzvf tiff-4.0.8.tar.gz
RUN tar -xzvf trio-1.10.tar.gz
# RUN tar -xzvf zlib-1.2.11.tar.gz

# Unpack dependencies in reverse order
# RUN cd zlib-1.2.11 \
#     && ./configure \
#     && make \
#     && make install

RUN cd trio-1.10 \
    && ./configure \
    && make \
    && make install

RUN cd tiff-4.0.8 \
    && ./configure \
    && make \
    && make install

RUN cd jpeg-9b \
    && ./configure \
    && make \
    && make install

RUN mkdir openjpeg-build \
    && cd openjpeg-build \
    && cmake -G"Unix Makefiles" ../openjpeg-2.3.0 \
    && make \
    && make install

RUN cd libxml2-2.9.6 \
    && ./configure \
    && make \
    && make install

# RUN cd libpng-1.6.31 \
#     && ./configure \
#     && make \
#     && make install

RUN cd libfpx-1.3.1-10 \
    && ./configure \
    && make \
    && make install

RUN cd jbigkit-2.1 \
    && make

# the below are looking for jpeg
RUN cd lcms2-2.8 \
    && ./configure \
    && make \
    && make install

# RUN cd libwebp-0.6.0 \
#     && ./configure \
#     && make \
#     && make install

RUN cd ImageMagick-* \
    && ./configure --with-webp \
    && make \
    && make install

# Checks
RUN /usr/local/bin/magick -list format | grep -i png
RUN /usr/local/bin/magick -list format | grep -i webp

# Remove tar files
RUN rm ImageMagick.tar.gz
RUN rm freetype-2.8.1.tar.gz
RUN rm freetype-doc-2.8.1.tar.gz
RUN rm ghostpdl-9.15.tar.gz
RUN rm ghostscript-9.22.tar.gz
RUN rm ghostscript-fonts-std-8.11.tar.gz
RUN rm hp2xx-3.4.4.tar.gz
RUN rm jbigkit-2.1.tar.gz
RUN rm jpegsr9b.zip
RUN rm jpegsrc.v9b.tar.gz
RUN rm lcms2-2.8.tar.gz
RUN rm libfpx-1.3.1-10.tar.gz
# RUN rm libpng-1.6.31.tar.gz
# RUN rm libwebp-0.6.0.tar.gz
RUN rm libwmf-0.2.8.4.tar.gz
RUN rm libxml2-2.9.6.tar.gz
RUN rm mpeg2dec-0.2.0.tar.gz
RUN rm mpeg2vidcodec_v12.tar.gz
RUN rm openjpeg-2.3.0.tar.gz
RUN rm tiff-4.0.8.tar.gz
RUN rm trio-1.10.tar.gz
# RUN rm zlib-1.2.11.tar.gz

# pip installation
RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
RUN python get-pip.py

# Exodus installation
RUN pip install --user exodus-bundler --no-warn-script-location
ENV PATH="~/.local/bin/:${PATH}"

# Create packages of imagemagick binary
RUN exodus -t /usr/local/bin/magick -o /usr/local/bin/exodus-magick.tgz
