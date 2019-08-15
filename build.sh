#!/bin/bash

docker build -t 'maisonette-magine:latest' --force-rm .

dockerimage=$(docker images -q -f=reference='maisonette-magine')

docker run $dockerimage

dockercontainer=$(docker container ls -alq)

# Only moving over a subset of binaries to keep under the 50MB limit.
docker cp $dockercontainer:/usr/local/bin/exodus-magick.tgz ./lambda/bin/magick.tgz

echo $(ls ./lambda/bin)
# Unzip the tar files
tar -xzvf ./lambda/bin/magick.tgz -C ./lambda/bin/
rm ./lambda/bin/magick.tgz

# Install packages
cd ./lambda && npm install && cd ..
LAMBDA_NAME=$1
MAGINE_BUCKET=$2
# Zip up the folder
LAMBDA_CODE=magine
zip --symlinks -r9 $LAMBDA_CODE.zip ./lambda
