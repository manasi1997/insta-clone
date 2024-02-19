const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads');
  },
  filename: function (req, file, cb) {
    const extension = file.mimetype.split('/')[1];
    cb(null, `${uuidv4()}.${extension}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('file');

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/posts', (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'File too large' });
    } else if (err) {
      return res.status(500).json({ message: 'Server error' });
    }
    const { description } = req.body;
    const filename = req.file.filename;
    const post = { filename, description, likes: 0, comments: [] };
    // Save post to database
    io.emit('newPost', post);
    return res.status(201).json(post);
  });
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});