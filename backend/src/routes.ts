import { Router } from 'express';
import multer from 'multer';
import { processImage, getPreview, downloadImage } from './controllers';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Routes for uploading and previewing images
router.post('/upload', upload.single('image'), processImage);
router.post('/preview', upload.single('image'), getPreview);

// Route for downloading the image in the requested format
router.get('/download', downloadImage);

export default router;
