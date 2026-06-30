import express from 'express';
import multer from 'multer';
import {
  uploadDocument,
  getDocuments,
  deleteDocument,
  getDocumentFile,
  getDocumentCounts,
} from '../controllers/documentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed'), false);
    }
  },
});

router.use(authenticateToken);

router.post('/upload', upload.array('files', 10), uploadDocument);
router.get('/:babyId/:category', getDocuments);
router.get('/counts/:babyId', getDocumentCounts);
router.get('/file/:id', getDocumentFile);
router.delete('/:id', deleteDocument);

export default router;
