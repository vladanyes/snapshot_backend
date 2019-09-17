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
app.use('/snapshot', express.static(path.join(__dirname, '../uploads')));

const LIMIT = 30;

app.post('/snapshot', uploadMiddleware.single('file'), (req, res) => {
  const uploadsPath = path.join(__dirname, '../uploads');

  fs.readdir(uploadsPath, (err, files) => {
    if (files.length >= LIMIT) {
      files.forEach(file => {
        if (req.file.filename === file) return;

        fs.unlink(`${uploadsPath}/${file}`, error => {
          if (error) throw err;
        });
      });
    }
  });

  res.status(200).send({
    id: req.file.filename,
  });
});

app.get('*', (req, res) => {
  res.status(404).send({ error: 'Page not found' });
});

app.listen(port, () => {
  console.warn('running on port', port);
});