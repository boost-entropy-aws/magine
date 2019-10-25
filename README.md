# magine
An image service for managing crops and optimizing sizes as part of API-driven requests.

## Usage
Via AWS S3:

1. Upload an image in a `master` bucket in S3 with a UUID hash as the "folder" name. (e.g. s3Bucket/media/has3-uuid-hax0r/image.jpg)
   a. `master` <- this will be the bucket which is configured for magine to listen to PUTs actions.
2. _(Optional)_ Upload a JSON file of the following format:
  ```
  {
    "name":"6-8y.png",
    "size":"31593",
    "type":"image/png",
    "ref":"module",
    "refId":"41",
    "field":"Content.category_taxon_shop_elements.5.category_taxon_shop_element_icon",
    "rule":"default"
  }
```
3. Image will automatically get processed based on the image type and optional image rule in the JSON.
4. Processed images get written to the asset S3 bucket under the same hash as the `master` location. (has3-uuid-hax0r).
5. _(Optional)_ SNS topic will publish the image data to your specificed URI with the asset hash and specified transformations.

Local: Still a WIP!

Via AWS Gateway: Still a WIP!

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
