const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Video Schema
const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  thumbnail: { type: String, required: true },
  channel: { type: String, required: true },
  views: { type: Number, default: 0 },
  uploadDate: { type: Date, default: Date.now },
  duration: { type: String, required: true },
  description: { type: String, default: '' },
  likes: { type: Number, default: 0 },
  category: { type: String, default: 'general' }
});

const Video = mongoose.model('Video', videoSchema);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'YouTube Clone API', status: 'running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/api/videos', async (req, res) => {
  try {
    const videos = await Video.find().sort({ uploadDate: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/seed', async (req, res) => {
  try {
    await Video.deleteMany({});
    
    const sampleVideos = [
      {
        title: 'React Tutorial for Beginners',
        thumbnail: 'https://img.youtube.com/vi/SqcY0GlETPk/maxresdefault.jpg',
        channel: 'Programming with Mosh',
        views: 1200000,
        duration: '2:30:45',
        description: 'Learn React from scratch',
        likes: 45000,
        category: 'education'
      }
    ];
    
    await Video.insertMany(sampleVideos);
    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// MongoDB connection and server start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });