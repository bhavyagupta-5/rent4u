const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: fileFilter,
});

const uploadToCloudinary = (fileBuffer, folder = 'rentmatch') => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_KEY || !process.env.CLOUDINARY_SECRET) {
      console.warn("Cloudinary not configured. Mocking image upload.");
      return resolve(`https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600`);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl || !process.env.CLOUDINARY_KEY) return;
  try {
    
    const segments = imageUrl.split('/');
    const fileWithExtension = segments[segments.length - 1];
    const fileName = fileWithExtension.split('.')[0];
    const folder = segments[segments.length - 2];
    const publicId = `${folder}/${fileName}`;

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary image deletion failed:", error.message);
  }
};

module.exports = {
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
};
