const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Folder na uploady
const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// Konfiguracja Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Statyczne pliki (upload.html, lista zdjęć itd.)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadFolder));

// Obsługa GET i HEAD dla strony głównej
app.all('/', (req, res) => res.redirect('/upload.html'));

// Endpoint do uploadu zdjęcia
app.post('/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Nie przesłano pliku.');
  }
  res.send('Plik przesłany pomyślnie.');
});

// Lista plików
app.get('/files', (req, res) => {
  fs.readdir(uploadFolder, (err, files) => {
    if (err) {
      return res.status(500).send('Błąd odczytu folderu.');
    }
    let fileLinks = files.map(file => `<li><a href="/uploads/${file}">${file}</a></li>`).join('');
    res.send(`<h1>Lista zdjęć</h1><ul>${fileLinks}</ul>`);
  });
});

// Start serwera
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
