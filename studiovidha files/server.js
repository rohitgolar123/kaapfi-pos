const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = 3000;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Images only'));
    cb(null, true);
  }
});

app.use(express.static(__dirname));
app.use('/uploads', express.static(uploadsDir));
app.use(express.json());

const metaFile = path.join(__dirname, 'photos.json');
const getMeta  = () => fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : [];
const saveMeta = (data) => fs.writeFileSync(metaFile, JSON.stringify(data, null, 2));

app.get('/api/photos', (req, res) => res.json(getMeta()));

app.post('/api/upload', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const meta  = getMeta();
  const entry = {
    id:         Date.now().toString(),
    filename:   req.file.filename,
    url:        '/uploads/' + req.file.filename,
    category:   (req.body.category  || 'Interior').trim(),
    title:      (req.body.title     || 'Project').trim(),
    location:   (req.body.location  || 'Nagpur').trim(),
    uploadedAt: new Date().toISOString()
  };
  meta.push(entry);
  saveMeta(meta);
  res.json(entry);
});

app.delete('/api/photos/:id', (req, res) => {
  const meta = getMeta();
  const idx  = meta.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = meta.splice(idx, 1);
  const filePath   = path.join(uploadsDir, removed.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  saveMeta(meta);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`\n  StudioVidha server →  http://localhost:${PORT}`);
  console.log(`  Main site          →  http://localhost:${PORT}/studiovidha-preview.html`);
  console.log(`  Admin portal       →  http://localhost:${PORT}/admin.html\n`);
});
