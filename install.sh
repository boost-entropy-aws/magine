#!/bin/bash

docker build -t 'maisonette-magine:latest' --force-rm .

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
