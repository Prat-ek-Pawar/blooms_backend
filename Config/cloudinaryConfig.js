
// Config/cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name:"dcncbnied"|| process.env.CLOUDINARY_CLOUD_NAME,
  api_key:"831341682564276"|| process.env.CLOUDINARY_API_KEY,
  api_secret:"HOujE2vLrt1WLKxWLjsdqRQWdKk"|| process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Test connection function
const testConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connected successfully:', result);
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error);
    return false;
  }
};

module.exports = cloudinary;
module.exports.testConnection = testConnection;
