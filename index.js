const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ==== STORAGE (multer) ====
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ts = Date.now();
    // prosta ochrona przed dziwnymi znakami w nazwach
    const safeOriginal = file.originalname.replace(/[^\w.\-]+/g, '_');
    cb(null, `${ts}-${safeOriginal}`);
  }
});

// limity i filtr mimetype (opcjonalnie możesz zmienić)
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB/plik
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Dozwolone są tylko pliki graficzne'), false);
    }
    cb(null, true);
  }
});

// ==== MIDDLEWARE statyczne ====
app.use(express.static(path.join(__dirname, 'public')));        // /upload.html, /gallery.html itd.
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // serwuj wgrane pliki

// twardy handler na wypadek problemów z serwowaniem statyków
app.get('/upload.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

// zdrowie usługi (do diagnostyki)
app.get('/healthz', (req, res) => res.send('ok'));

// ==== API ====
app.post('/upload', upload.array('photos', 20), (req, res) => {
  res.send('Zdjęcia zostały przesłane!');
});

app.get('/gallery-data', (req, res) => {
  const uploadDir = path.join(__dirname, 'uploads');
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Nie udało się wczytać plików' });
    // tylko pliki obrazów
    const imageUrls = (files || [])
        .filter(f => /\.(jpe?g|png|gif|webp|bmp|tiff?)$/i.test(f))
        .map(f => `/uploads/${f}`);
    res.json(imageUrls);
  });
});

// przekierowanie root -> upload
app.get('/', (req, res) => res.redirect('/upload.html'));

// prosty handler błędów (np. z Multera)
app.use((err, req, res, next) => {
  console.error('Błąd:', err.message);
  res.status(400).send(err.message || 'Błąd żądania');
});

// ==== START (IPv4) ====
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serwer działa na porcie ${PORT} (IPv4)`);
});
