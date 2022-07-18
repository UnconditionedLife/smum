# Hosting / AWS Configuration
The site code and data are hosted on `Amazon Web Services` (AWS). 

## Code Hosting
The code is hosted on `AWS S3` service and served through `AWS CloudFront` (Global Content Delivery Network).

## Data hosting & access 

# Code Version Update Processes
Version updates are built in Visual Studio Code using `npm run build*`. The build process increments the version number stored in `package.json`. The build code bundles and other assets that are generated are hashed.

## Build Patch
Generating a build patch is done by runing the `npm run buildpatch` script. The script will increment the `patch` (major.minor.patch) version number and generate the code bundles and other assets in the `/build` folder.

## Build Minor
Generating a build patch is done by runing the `npm run buildminor` script. The script will increment the `minor` (major.minor.patch) version number and generate the code bundles and other assets in the `/build` folder.

## Build Major
Generating a build patch is done by runing the `npm run buildmajor` script. The script will increment the `major` (major.minor.patch) version number and generate the code bundles and other assets in the `/build` folder.

# Moving Code to S3
Once the build code has been generated the next step is to log in to AWS S3 in the `foodbank.click` bucket.
1. Make a copy of the existing version of the code in a new folder named for the version number. Usually, 3 or 4 previous versions are maintained.
2. Copy assets and code bundels from `/build` in the code base to `/public` in the the root of the S3 bucket.
3. Copy `index.html` from `/build` in the code base to the `/` root of the `foodbank.click` bucket.
4. Open the `CloudFront` service and go to the `ECK0BVL24R33L` (foodbank.click) distribution. This used to kill the cached files in the CDN.
5. Click `Invalidations` in the tab menu.
6. Either copy existing validaiton or create a new validation for `\index.html`. (Because the code is hashed, we only need to invalidate the index.htm file)