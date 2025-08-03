const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Konfiguracja miejsca zapisu zdjęć
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Serwujemy statyczny frontend (np. upload.html, gallery.html)
app.use(express.static(path.join(__dirname, 'public')));

// Serwujemy przesłane pliki (dla galerii)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Endpoint do uploadu zdjęć
app.post('/upload', upload.array('photos', 20), (req, res) => {
  res.send('Zdjęcia zostały przesłane!');
});

// Endpoint zwracający listę zdjęć do galerii
app.get('/gallery-data', (req, res) => {
  const uploadDir = path.join(__dirname, 'uploads');
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Nie udało się wczytać plików' });
    }
    const imageUrls = files.map(file => `/uploads/${file}`);
    res.json(imageUrls);
  });
});

// Przekierowanie "/" → "/upload.html"
app.get('/', (req, res) => {
  res.redirect('/upload.html');
});

// Start serwera
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
