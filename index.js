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

// Serwujemy statyczny frontend (np. upload.html)
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint do uploadu zdjęć
app.post('/upload', upload.array('photos', 20), (req, res) => {
  res.send('Zdjęcia zostały przesłane!');
});

// Przekierowanie z "/" na "/upload.html"
app.get('/', (req, res) => {
  res.redirect('/upload.html');
});

// Start serwera
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
