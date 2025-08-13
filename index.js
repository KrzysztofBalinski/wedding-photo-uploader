const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Katalog na przesłane pliki
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Konfiguracja Multer z limitem 150 MB
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 150 * 1024 * 1024 }, // 150 MB
}).array('photos', 50); // obsługa wielu plików w jednym uploadzie

// Serwowanie plików statycznych (HTML, CSS, JS, itp.)
app.use(express.static(path.join(__dirname, 'public')));

// 🔹 Przekierowanie z "/" na "/upload.html"
app.get('/', (req, res) => {
  res.redirect('/upload.html');
});

// Endpoint do przesyłania zdjęć/wideo
app.post('/upload', (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Błąd Multer:', err);
      return res.status(500).send('Błąd przesyłania zdjęć: ' + err.message);
    } else if (err) {
      console.error('Błąd serwera:', err);
      return res.status(500).send('Błąd serwera: ' + err.message);
    }
    res.send('Pliki przesłane pomyślnie!');
  });
});

// Podgląd listy plików
app.get('/files', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).send('Błąd odczytu plików');
    }
    let fileLinks = files.map(f => `<li><a href="/uploads/${f}" target="_blank">${f}</a></li>`).join('');
    res.send(`<h1>Przesłane pliki</h1><ul>${fileLinks}</ul>`);
  });
});

// Umożliwienie pobierania przesłanych plików
app.use('/uploads', express.static(uploadDir));

// Start serwera
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
