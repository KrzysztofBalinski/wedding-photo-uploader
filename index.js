const express = require('express');
const multer  = require('multer');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// === katalog na uploady ===
const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

// === Multer: 150 MB, bez wrażliwości na nazwę pola (any) ===
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename:    (_, file, cb) => {
    const safe = (file.originalname || 'file').replace(/[^\w.\-]+/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 150 * 1024 * 1024 } // 150 MB/plik
}).any();

// === zdrowie (na wszelki wypadek) ===
app.get('/healthz', (_, res) => res.send('ok'));

// === PRZEKIEROWANIE / -> /upload.html (GET/HEAD) ===
app.all('/', (req, res) => res.redirect('/upload.html'));

// === statyki ===
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadDir));

// === upload endpoint ===
app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).send('Błąd przesyłania: ' + (err.message || 'nieznany błąd'));
    }
    res.send('Pliki przesłane pomyślnie!');
  });
});

// === lista plików ===
app.get('/files', (_, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).send('Błąd odczytu plików.');
    const list = (files || [])
        .map(f => `<li><a href="/uploads/${encodeURIComponent(f)}" target="_blank">${f}</a></li>`)
        .join('');
    res.send(`<h1>Wgrane pliki</h1><ul>${list}</ul>`);
  });
});

// === start ===
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});