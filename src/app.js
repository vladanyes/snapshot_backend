const path = require('path');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const uploadMiddleware = require('./upload-middleware');

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const LIMIT = 30;
const GIT_KEEP_FILE = '.gitkeep';

app.post('/snapshot', uploadMiddleware.single('file'), (req, res) => {
  const reqFileName = req.file.filename;
  const uploadsPath = path.join(__dirname, '../uploads');

  fs.readdir(uploadsPath, (err, files) => {
    if (files.length >= LIMIT) {
      files.forEach(file => {
        if (file === reqFileName || file === GIT_KEEP_FILE) return;

        fs.unlink(`${uploadsPath}/${file}`, error => {
          if (error) throw err;
        });
      });
    }
  });

  res.status(200).send({
    url: `https://snapshot--backend.herokuapp.com/uploads/${reqFileName}`,
    name: reqFileName,
  });
});

app.get('*', (req, res) => {
  res.status(404).send({ error: 'Page not found' });
});

app.listen(port, () => {
  console.warn('running on port', port);
});
