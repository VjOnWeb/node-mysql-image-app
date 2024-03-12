const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql');

const app = express();
const port = 6888;

// MySQL database connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root2',
  password: 'Qwert@04',
  database: 'node_app'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255),
      data LONGBLOB
    )
  `;
  connection.query(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating table:', err);
      return;
    }
    console.log('Table created successfully');
  });
});

// app.use(bodyParser.json());

// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// API endpoints
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend.html'));
});

app.post('/upload', upload.single('image'), (req, res) => {
  const { filename } = req.file;
  const dataStream = fs.createReadStream(req.file.path);
  let imageData = Buffer.alloc(0);

  // Read data from the stream
  dataStream.on('data', (chunk) => {
    imageData = Buffer.concat([imageData, chunk]);
  });

  // After all data is read
  dataStream.on('end', () => {
    // Insert filename and image data into MySQL database
    const insertQuery = 'INSERT INTO images (filename, data) VALUES (?, ?)';
    connection.query(insertQuery, [filename, imageData], (err, results) => {
      if (err) {
        console.error('Error inserting image into MySQL database:', err);
        // Cleanup: Remove the temporary file
        fs.unlinkSync(req.file.path);
        return res.status(500).send('Error uploading image');
      }
      // Cleanup: Remove the temporary file
      fs.unlinkSync(req.file.path);
      res.send('Image uploaded successfully!');
    });
  });
});


// API endpoint to retrieve all images from MySQL database

// API endpoint to retrieve all images from MySQL database
app.get('/images', (req, res) => {
  const selectQuery = 'SELECT id, filename, data FROM images';
  connection.query(selectQuery, (err, results) => {
    if (err) {
      console.error('Error fetching images from MySQL database:', err);
      return res.status(500).send('Error fetching images');
    }
    // Convert binary data to base64 for frontend display
    results.forEach(image => {
      image.data = Buffer.from(image.data).toString('base64');
    });
    res.json(results);
  });
});


// API endpoint to delete an image from MySQL database and local folder
app.delete('/images/:id', (req, res) => {
  const { id } = req.params;

  // Delete image from MySQL database
  const deleteQuery = 'DELETE FROM images WHERE id = ?';
  connection.query(deleteQuery, [id], (err, results) => {
    if (err) {
      console.error('Error deleting image from MySQL database:', err);
      return res.status(500).send('Error deleting image');
    }
    res.send('Image deleted successfully!');
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//http://localhost:6888