const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

// === Ścieżki ===
const rootDir    = __dirname;
const publicDir  = path.join(rootDir, 'public');
const uploadsDir = path.join(rootDir, 'uploads');

// upewnij się, że /uploads istnieje
fs.mkdirSync(uploadsDir, { recursive: true });

// wykryj gdzie jest upload.html (public/ lub root)
const uploadHtmlPath = fs.existsSync(path.join(publicDir, 'upload.html'))
    ? path.join(publicDir, 'upload.html')
    : path.join(rootDir, 'upload.html');

// === Multer (150 MB, dowolne pole pliku) ===
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename:    (_, file, cb) => {
    const safe = file.originalname.replace(/[^\w.\-]+/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 150 * 1024 * 1024 } // 150 MB/plik
}).any(); // akceptuj dowolną nazwę pola

// === Statyki ===
// najpierw /public (jeśli jest), potem root (na wypadek upload.html w root)
if (fs.existsSync(publicDir)) app.use(express.static(publicDir));
app.use(express.static(rootDir));
// serwuj wgrane pliki
app.use('/uploads', express.static(uploadsDir));

// === Routing ===
// GET/HEAD "/" -> /upload.html
app.all('/', (req, res) => res.redirect('/upload.html'));

// zawsze serwuj konkretnego upload.html z wykrytej ścieżki
app.get('/upload.html', (req, res) => res.sendFile(uploadHtmlPath));

// upload wielu plików (zdjęcia/wideo)
app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).send('Błąd przesyłania: ' + err.message);
    } else if (err) {
      console.error('Server error:', err);
      return res.status(500).send('Błąd serwera: ' + err.message);
    }
    return res.send('Pliki przesłane pomyślnie!');
  });
});

// prosta lista plików
app.get('/files', (_, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) return res.status(500).send('Błąd odczytu plików.');
    const list = (files||[]).map(f => `<li><a href="/uploads/${encodeURIComponent(f)}" target="_blank">${f}</a></li>`).join('');
    res.send(`<h1>Przesłane pliki</h1><ul>${list}</ul>`);
  });
});

// start
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
