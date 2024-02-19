import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import '../public/css/styles.css';

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

export default function handler(req, res) {
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
    return res.status(201).json(post);
  });
}