const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Folder na przesłane pliki
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
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 150 * 1024 * 1024 } // 150 MB
});

// Przekierowanie z "/" na "/upload.html"
app.all('/', (req, res) => res.redirect('/upload.html'));


// Udostępnianie folderu publicznego
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint do przesyłania plików
app.post('/upload', upload.array('photos', 50), (req, res) => {
  res.send('Pliki zostały przesłane pomyślnie!');
});

// Podgląd wgranych plików
app.get('/files', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).send('Błąd odczytu plików');
    let list = files.map(f => `<li><a href="/uploads/${f}">${f}</a></li>`).join('');
    res.send(`<h1>Wgrane pliki</h1><ul>${list}</ul>`);
  });
});

// Udostępnianie folderu z uploadami
app.use('/uploads', express.static(uploadDir));

// Start serwera
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
