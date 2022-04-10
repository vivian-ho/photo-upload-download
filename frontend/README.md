# Notes on what this app does

<img src="https://s3uploader-s3uploadbucket-1kjnw6fxg2vhh.s3.amazonaws.com/happy.png" alt="screenshot" title="file upload/download" width="600"/>

The frontend consists of 2 main functions: \
1) image upload
2) image download

The following have been fully or partially implemented:\
Responsive design\
Lazy loading\
Accessibility\
Animation\
Loading animation (spinner)\

User has the ability to upload an image and download multiple images into a zip package saved to a local folder.\

Code for upload and download backend services is available in these folders:\
../upload \
../get-content \
../load \
These backend services are lambda functions that have been deployed and accessible via url's defined in  ./src/config.json \
For example: in postman, you can run GET  https://ksmukx12hl.execute-api.us-east-1.amazonaws.com/uploads?fileName=test.png&title=test-title&desc=test-desc. It then would generate a pre-signed url for the upload process.
You will not be able to deploy them yourselves since these services are tied to my AWS credentials, \ 
however you should be able to call the pre-deployed service urls directly, even outside of this app \
(Notes: to run this app, it doesn't require re-deployment of the backend services)

## To use this app

You can run:

### `cd frontend`
### `yarn`
### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

This app has been tested with the happy path scenarios. No corner, edge cases have been tested or considered (for example: testing with a huge image, or a non-image file)

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.
