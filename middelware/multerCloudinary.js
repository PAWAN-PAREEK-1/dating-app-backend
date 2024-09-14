import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinaryConfig.js'; 

const createUploadMiddleware = (folderName) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folderName,
      allowed_formats: ['jpg', 'png', 'jpeg'],
      public_id: (req, file) => `${Date.now()}-${file.originalname}`,
    },
  });

  return multer({ storage: storage });
};


const uploadProfile = createUploadMiddleware('profilePictures');
const uploadChat = createUploadMiddleware('chatFiles');


export { uploadProfile, uploadChat };
