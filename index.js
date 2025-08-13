const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Folder na pliki
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Konfiguracja Multer z limitem 150 MB
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 150 * 1024 * 1024 } // 150 MB
}).any(); // <-- akceptuj dowolną nazwę pola

// Obsługa plików statycznych (formularz + przesłane pliki)
app.use(express.static(path.join(__dirname)));

// Endpoint do uploadu
app.post('/upload', (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).send('Błąd Multer: ' + err.message);
    } else if (err) {
      return res.status(500).send('Błąd serwera: ' + err.message);
    }
    res.send('Pliki przesłane pomyślnie!');
  });
});

// Strona z listą plików
app.get('/files', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).send('Błąd odczytu plików.');
    }
    let fileLinks = files.map(file => `<li><a href="/uploads/${file}">${file}</a></li>`).join('');
    res.send(`<h1>Lista plików</h1><ul>${fileLinks}</ul>`);
  });
});

// Umożliwienie pobierania przesłanych plików
app.use('/uploads', express.static(uploadDir));

// Start serwera
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});