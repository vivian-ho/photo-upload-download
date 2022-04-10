# lambda functions to upload and download images

This application allows you to upload objects to S3 directly from your end-user application using Signed URLs.

```bash
.
├── README.MD                   <-- This instructions file
├── frontend                    <-- Simple JavaScript application illustrating upload
├── upload                <-- Source code for the serverless backend that has a lambda function to allow uploading an image directly into an S3 bucket
├── load                <-- Source code for the serverless backend that has a lambda function to allow fetching of all objects from a S3 bucket
├── get-content                <-- Source code for the serverless backend that has a lambda function to allow downloading content of an image from a S3 bucket
```

### Installing the application

You will not be able to deploy with your own AWS credentials, this is just a general guideline on how to deploy. (You can clone the code and \
use your own AWS credentials to deploy with some modification to the config file, however) \

cd to each folder (upload, load, get-content), run the following:
```
sam deploy --guided
```

When prompted for parameters, enter:
- Stack Name: [provide a stack name]
- AWS Region: your preferred AWS Region (e.g. us-east-1)
- Accept all other defaults.

This takes several minutes to deploy. At the end of the deployment, note the output values, as you need these later.

- The APIendpoint value is important - it looks like https://ab123345677.execute-api.us-west-2.amazonaws.com.
- **The upload URL is your endpoint** with the /uploads route added - for example: https://ab123345677.execute-api.us-west-2.amazonaws.com/uploads.

### Testing with the frontend application

The frontend code is saved in the `frontend` subdirectory.

1. Go to the frontend folder and run:
yarn \
yarn start \

http://localhost:3000 \

2. Once the page is loaded from a remote location, upload an image file (jpg, png, gif) in the front-end and you will see the object in the backend S3 bucket. The uploaded image will be hot loaded in the front end as well.
