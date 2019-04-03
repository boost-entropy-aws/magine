# magine
An image service for managing crops and optimizing sizes as part of API-driven requests.

## Usage
TBD, but most likely as an interface to an API-Gateway driven Lambda function, you would pass a URL structure to this, and get returned with an image URL.

## WIP
As this is a work-in-progress, use at own risk. Please review https://github.com/MaisonetteWorld/magine/issues/1 to see if we are in 1.0.0 status.

## AWS SAM


To test locally build the Lambda using SAM:
```
sam build
```

Run the Magine function by passing in a sample event
```
sam local invoke MagineFunction -e lambda/schema/sample_s3_event.json
```