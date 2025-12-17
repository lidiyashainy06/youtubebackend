const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/youtube-clone');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

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
  dislikes: { type: Number, default: 0 },
  category: { type: String, default: 'general' },
  videoUrl: { type: String, default: '' }
});

const Video = mongoose.model('Video', videoSchema);

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'YouTube Clone API Server', 
    endpoints: [
      'GET /health',
      'GET /api/videos',
      'GET /api/videos/trending',
      'POST /api/videos',
      'POST /api/seed'
    ]
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.get('/api/videos', async (req, res) => {
  try {
    const videos = await Video.find().sort({ uploadDate: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/videos/trending', async (req, res) => {
  try {
    const videos = await Video.find().sort({ views: -1 }).limit(20);
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/videos/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    video.views += 1;
    await video.save();
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/videos', async (req, res) => {
  try {
    const video = new Video(req.body);
    const savedVideo = await video.save();
    res.status(201).json(savedVideo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/seed', async (req, res) => {
  try {
    await Video.deleteMany({});
    
    const sampleVideos = [
      {
        title: 'React Tutorial for Beginners - Complete Course',
        thumbnail: 'https://img.youtube.com/vi/SqcY0GlETPk/maxresdefault.jpg',
        channel: 'Programming with Mosh',
        views: 1200000,
        duration: '2:30:45',
        description: 'Learn React from scratch in this comprehensive tutorial.',
        likes: 45000,
        category: 'education',
        videoUrl: 'https://www.youtube.com/embed/SqcY0GlETPk'
      },
      {
        title: 'Node.js Crash Course - Build a REST API',
        thumbnail: 'https://img.youtube.com/vi/fBNz5xF-Kx4/maxresdefault.jpg',
        channel: 'Traversy Media',
        views: 850000,
        duration: '1:45:30',
        description: 'Build a complete REST API with Node.js and Express.',
        likes: 32000,
        category: 'education',
        videoUrl: 'https://www.youtube.com/embed/fBNz5xF-Kx4'
      },
      {
        title: 'MongoDB Tutorial - Complete Guide',
        thumbnail: 'https://img.youtube.com/vi/pWbMrx5rVBE/maxresdefault.jpg',
        channel: 'Net Ninja',
        views: 650000,
        duration: '3:15:20',
        description: 'Master MongoDB with this complete tutorial.',
        likes: 28000,
        category: 'education',
        videoUrl: 'https://www.youtube.com/embed/pWbMrx5rVBE'
      }
    ];
    
    await Video.insertMany(sampleVideos);
    res.json({ message: 'Database seeded successfully', count: sampleVideos.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found', 
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /api/videos',
      'POST /api/seed'
    ]
  });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('- GET /health');
    console.log('- GET /api/videos');
    console.log('- POST /api/seed');
  });
});