import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { BabyDocument, Baby } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_ROOT = path.resolve(__dirname, '../../uploads/documents');

const CATEGORY_FOLDERS = {
  discharge_summary: 'discharge_summary',
  immunization_card: 'immunization_card',
  birth_registration: 'birth_registration',
  medical_records: 'medical_records',
};

const ALLOWED_MIMES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE = 20 * 1024 * 1024;

function ensureCategoryDir(category) {
  const dir = path.join(UPLOAD_ROOT, CATEGORY_FOLDERS[category]);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getExtension(filename) {
  return path.extname(filename).toLowerCase();
}

function generateStoredName(originalName) {
  const ext = getExtension(originalName);
  return `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export const uploadDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { baby_id, category, document_name, notes } = req.body;

    if (!baby_id || !category || !document_name) {
      return res.status(400).json({ detail: 'baby_id, category, and document_name are required' });
    }

    if (!CATEGORY_FOLDERS[category]) {
      return res.status(400).json({ detail: 'Invalid category' });
    }

    const baby = await Baby.findOne({ where: { id: baby_id, user_id: userId } });
    if (!baby) {
      return res.status(404).json({ detail: 'Baby not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ detail: 'No files uploaded' });
    }

    const uploadedDocs = [];

    for (const file of req.files) {
      const ext = getExtension(file.originalname);
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return res.status(400).json({ detail: `File type "${ext}" is not allowed. Allowed: PDF, JPG, JPEG, PNG` });
      }

      if (file.size > MAX_FILE_SIZE) {
        return res.status(400).json({ detail: `File "${file.originalname}" exceeds 20 MB limit` });
      }

      const targetDir = ensureCategoryDir(category);
      const storedName = generateStoredName(file.originalname);
      const filePath = path.join(targetDir, storedName);
      const relativePath = path.join('uploads/documents', CATEGORY_FOLDERS[category], storedName);

      fs.writeFileSync(filePath, file.buffer);

      const doc = await BabyDocument.create({
        baby_id: parseInt(baby_id),
        category,
        document_name,
        notes: notes || null,
        original_file_name: file.originalname,
        stored_file_name: storedName,
        file_path: relativePath,
        mime_type: file.mimetype,
        file_size: file.size,
        uploaded_at: new Date(),
      });

      uploadedDocs.push({
        ...doc.toJSON(),
        file_size_formatted: formatFileSize(doc.file_size),
      });
    }

    return res.status(201).json(uploadedDocs.length === 1 ? uploadedDocs[0] : uploadedDocs);
  } catch (error) {
    console.error('Error uploading document:', error);
    return res.status(500).json({ detail: 'Error uploading document' });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const { babyId, category } = req.params;
    const userId = req.user.id;

    if (!CATEGORY_FOLDERS[category]) {
      return res.status(400).json({ detail: 'Invalid category' });
    }

    const baby = await Baby.findOne({ where: { id: babyId, user_id: userId } });
    if (!baby) {
      return res.status(404).json({ detail: 'Baby not found' });
    }

    const docs = await BabyDocument.findAll({
      where: { baby_id: babyId, category },
      order: [['uploaded_at', 'DESC']],
    });

    const result = docs.map(d => ({
      ...d.toJSON(),
      file_size_formatted: formatFileSize(d.file_size),
    }));

    return res.json(result);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({ detail: 'Error fetching documents' });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const doc = await BabyDocument.findByPk(id, {
      include: [{ model: Baby, where: { user_id: userId }, required: true }],
    });

    if (!doc) {
      return res.status(404).json({ detail: 'Document not found' });
    }

    const absolutePath = path.resolve(__dirname, '../../', doc.file_path);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    await doc.destroy();
    return res.status(204).end();
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({ detail: 'Error deleting document' });
  }
};

export const getDocumentFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const doc = await BabyDocument.findByPk(id, {
      include: [{ model: Baby, where: { user_id: userId }, required: true }],
    });

    if (!doc) {
      return res.status(404).json({ detail: 'Document not found' });
    }

    const absolutePath = path.resolve(__dirname, '../../', doc.file_path);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ detail: 'File not found on disk' });
    }

    res.setHeader('Content-Type', doc.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${doc.original_file_name}"`);
    res.setHeader('Content-Length', doc.file_size);

    const stream = fs.createReadStream(absolutePath);
    stream.pipe(res);
  } catch (error) {
    console.error('Error serving document file:', error);
    return res.status(500).json({ detail: 'Error serving document file' });
  }
};

export const getDocumentCounts = async (req, res) => {
  try {
    const { babyId } = req.params;
    const userId = req.user.id;

    const baby = await Baby.findOne({ where: { id: babyId, user_id: userId } });
    if (!baby) {
      return res.status(404).json({ detail: 'Baby not found' });
    }

    const categories = Object.keys(CATEGORY_FOLDERS);
    const counts = {};

    for (const cat of categories) {
      const count = await BabyDocument.count({ where: { baby_id: babyId, category: cat } });
      counts[cat] = count;
    }

    return res.json(counts);
  } catch (error) {
    console.error('Error fetching document counts:', error);
    return res.status(500).json({ detail: 'Error fetching document counts' });
  }
};
