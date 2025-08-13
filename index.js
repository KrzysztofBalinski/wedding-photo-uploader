const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Upewnij się, że katalog uploads istnieje
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📂 Utworzono folder uploads');
}

// Konfiguracja Multer z limitem 100 MB
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
  limits: { fileSize: 100 * 1024 * 1024 } // 100 MB
});

// Serwowanie plików statycznych
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadDir));

// Obsługa uploadu
app.post('/upload', upload.array('photos'), (req, res) => {
  try {
    console.log(`📸 Otrzymano ${req.files.length} plików`);
    res.send('Pliki zostały przesłane pomyślnie!');
  } catch (err) {
    console.error('❌ Błąd uploadu:', err);
    res.status(500).send('Błąd przesyłania zdjęć.');
  }
});

// Lista przesłanych plików
app.get('/gallery', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error('❌ Błąd odczytu folderu uploads:', err);
      return res.status(500).send('Błąd odczytu plików.');
    }
    const fileLinks = files.map(file => `<li><a href="/uploads/${file}">${file}</a></li>`).join('');
    res.send(`<h1>Galeria zdjęć</h1><ul>${fileLinks}</ul>`);
  });
});

// Start serwera
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serwer działa na porcie ${PORT}`);
});
