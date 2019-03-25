#!/bin/bash
echo $(pwd)
curl https://imagemagick.org/download/ImageMagick.tar.gz -o `pwd`/ImageMagick.tar.gz
tar -xzvf ImageMagick.tar.gz
rm ImageMagick.tar.gz
IMAGEMAGICK_VERSION=$(find `pwd` -name ImageMagick* | sed -n 's/.*\/ImageMagick-\(.*\)/\1/p')
rm -rf ImageMagick-$IMAGEMAGICK_VERSION

echo $IMAGEMAGICK_VERSION

docker build --build-arg imagemagickVersion=$IMAGEMAGICK_VERSION -t 'maisonette-magine:latest' --force-rm .

dockerimage=$(docker images -q -f=reference='maisonette-magine')

docker run $dockerimage

dockercontainer=$(docker container ls -alq)

docker cp $dockercontainer:/usr/local/bin/exodus-magick ./exodus-magick
docker cp $dockercontainer:/usr/local/bin/exodus-compare ./exodus-compare
docker cp $dockercontainer:/usr/local/bin/exodus-composite ./exodus-composite
docker cp $dockercontainer:/usr/local/bin/exodus-conjure ./exodus-conjure
docker cp $dockercontainer:/usr/local/bin/exodus-convert ./exodus-convert
docker cp $dockercontainer:/usr/local/bin/exodus-display ./exodus-display
docker cp $dockercontainer:/usr/local/bin/exodus-identify ./exodus-identify
docker cp $dockercontainer:/usr/local/bin/exodus-import ./exodus-import
docker cp $dockercontainer:/usr/local/bin/exodus-import ./exodus-import
docker cp $dockercontainer:/usr/local/bin/exodus-mogrify ./exodus-mogrify
docker cp $dockercontainer:/usr/local/bin/exodus-montage ./exodus-montage
docker cp $dockercontainer:/usr/local/bin/exodus-stream ./exodus-stream
docker cp $dockercontainer:/usr/local/bin/exodus-cwebp ./exodus-cwebp
docker cp $dockercontainer:/usr/local/bin/exodus-dwebp ./exodus-dwebp
