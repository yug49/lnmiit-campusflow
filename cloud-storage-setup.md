# Cloud Storage Setup for Vercel Deployment

Since Vercel's serverless functions are stateless and ephemeral, they can't reliably store uploaded files. Currently, your application relies on local file storage in the `/uploads` directory, which won't work in production.

## Recommended Cloud Storage Solutions

### Option 1: Cloudinary (Easiest to implement)

1. Create an account at [cloudinary.com](https://cloudinary.com/)
2. Get your API credentials
3. Add the following environment variables to Vercel:

   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. Update your file upload utilities to use Cloudinary instead of local storage.

### Option 2: AWS S3

1. Create an AWS account and set up an S3 bucket
2. Set up IAM credentials with permissions for that bucket
3. Add the following environment variables to Vercel:

   ```
   AWS_S3_BUCKET_NAME=your_bucket_name
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   AWS_REGION=your_bucket_region
   ```

4. Update your file upload utilities to use S3 instead of local storage.

### Option 3: Firebase Storage

1. Set up a Firebase project
2. Configure Firebase Storage
3. Add the Firebase configuration to your environment variables

## Implementation Example (Cloudinary)

Here's a quick example of how to modify your `utils/cloudinary.js` file:

```javascript
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary
 * @param {String} filePath - Path to the file to upload
 * @param {String} folder - Cloudinary folder to store the file in
 * @returns {Promise} - Cloudinary upload result
 */
const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: "auto",
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("File upload failed");
  }
};

/**
 * Delete a file from Cloudinary
 * @param {String} publicId - Cloudinary public ID of the file
 * @returns {Promise} - Cloudinary deletion result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error("File deletion failed");
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};
```
