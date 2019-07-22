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
LAMBDA_CODE=magine-$(date +%Y%m%d-%H%M)
zip --symlinks -r9 $LAMBDA_CODE.zip ./lambda
aws s3 cp $LAMBDA_CODE.zip s3://$MAGINE_BUCKET/$LAMBDA_CODE.zip
aws lambda update-function-code --function-name $LAMBDA_NAME --s3-bucket $MAGINE_BUCKET --s3-key $LAMBDA_CODE.zip --publish
