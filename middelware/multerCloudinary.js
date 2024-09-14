import multer from 'multer';
import cloudinary from '../config/cloudinaryConfig.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';



// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profilePictures',
    allowed_formats: ['jpg', 'png', 'jpeg'], 
  },
});

const upload = multer({ storage :storage});

export { upload };
