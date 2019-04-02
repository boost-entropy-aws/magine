#!/bin/bash
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

# Only moving over a subset of binaries to keep under the 50MB limit.
docker cp $dockercontainer:/usr/local/bin/exodus-magick.tgz ./lambda/bin/magick.tgz

echo $(ls ./lambda/bin)
# Unzip the tar files
tar -xzvf ./lambda/bin/magick.tgz -C ./lambda/bin/
rm ./lambda/bin/magick.tgz

# Install packages
cd ./lambda && npm install && cd ..

# Zip up the folder
LAMBDA_CODE=magine-$(date +%Y%m%d-%H%M)
zip -r9 $LAMBDA_CODE.zip ./lambda
aws s3 cp $LAMBDA_CODE.zip s3://$BUCKET/$LAMBDA_CODE.zip
aws lambda update-function-code --function-name $LAMBDA_NAME --s3-bucket $BUCKET --s3-key $LAMBDA_CODE.zip --publish
