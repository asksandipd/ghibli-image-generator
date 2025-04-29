// server.js - using ES Module syntax
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

// ES Module compatibility fixes
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Enable CORS for your React app
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your Vite app URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Path to save images
const ghibliImagesFolder = path.join(os.homedir(), 'Downloads', 'ImagesGhibli');
console.log(`Images will be saved to: ${ghibliImagesFolder}`);

// Ensure the directory exists
if (!fs.existsSync(ghibliImagesFolder)) {
  fs.mkdirSync(ghibliImagesFolder, { recursive: true });
  console.log(`Created directory: ${ghibliImagesFolder}`);
}

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ghibliImagesFolder);
  },
  filename: (req, file, cb) => {
    const randomString = uuidv4().substring(0, 8);
    cb(null, `image_${randomString}.png`);
  }
});

const upload = multer({ storage });

// Endpoint to save images
app.post('/api/save-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }
    
    const filename = req.file.filename;
    const filePath = path.join(ghibliImagesFolder, filename);
    
    console.log(`Image saved: ${filePath}`);
    
    res.json({ 
      success: true, 
      filename,
      path: `/gallery-images/${filename}` 
    });
  } catch (error) {
    console.error('Error saving image:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Endpoint to get gallery images
app.get('/api/gallery-images', (req, res) => {
  try {
    const files = fs.readdirSync(ghibliImagesFolder);
    
    const images = files
      .filter(file => file.endsWith('.png') || file.endsWith('.jpg'))
      .map(file => {
        const filePath = path.join(ghibliImagesFolder, file);
        const stats = fs.statSync(filePath);
        
        return {
          filename: file,
          url: `/gallery-images/${file}`,
          dateCreated: stats.birthtime || stats.mtime,
          size: stats.size
        };
      })
      // Sort by creation date, newest first
      .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
    
    console.log(`Gallery images found: ${images.length}`);
    res.json({ images });
  } catch (err) {
    console.error('Error getting gallery images:', err);
    res.status(500).json({ error: 'Failed to get gallery images' });
  }
});

// Serve the image files with proper MIME types
app.use('/gallery-images', (req, res, next) => {
  res.set('Cache-Control', 'no-cache');
  next();
}, express.static(ghibliImagesFolder));

// Add a simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Saving images to: ${ghibliImagesFolder}`);
  console.log(`Gallery images will be accessible at: http://localhost:${PORT}/gallery-images/`);
});