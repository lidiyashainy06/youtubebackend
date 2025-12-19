const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

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

const User = mongoose.model('User', userSchema);
const Video = mongoose.model('Video', videoSchema);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'YouTube Clone API', status: 'running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const videoCount = await Video.countDocuments();
    res.json({ 
      message: 'Database connected', 
      users: userCount, 
      videos: videoCount,
      dbState: mongoose.connection.readyState 
    });
  } catch (error) {
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// Auth Routes
app.post('/api/register', async (req, res) => {
  try {
    console.log('Registration request:', req.body);
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = new User({ username, email, password });
    const savedUser = await user.save();
    console.log('User saved:', savedUser._id);
    
    res.status(201).json({ 
      message: 'User registered successfully', 
      userId: savedUser._id,
      username: savedUser.username 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    console.log('Login request:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    res.json({ 
      message: 'Login successful', 
      userId: user._id, 
      username: user.username,
      email: user.email 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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
        title: 'Building a Full-Stack AI Chat App with Next.js 14',
        thumbnail: 'https://img.youtube.com/vi/mkggwXoG0pE/maxresdefault.jpg',
        channel: 'JavaScript Mastery',
        views: 2500000,
        duration: '3:45:20',
        description: 'Complete tutorial on building an AI-powered chat application',
        likes: 85000,
        category: 'technology'
      },
      {
        title: 'The Future of Web Development in 2024',
        thumbnail: 'https://img.youtube.com/vi/1h2blQtdMuE/maxresdefault.jpg',
        channel: 'Fireship',
        views: 1800000,
        duration: '12:30',
        description: 'Latest trends and technologies shaping web development',
        likes: 95000,
        category: 'technology'
      },
      {
        title: 'Cooking the Perfect Italian Pasta from Scratch',
        thumbnail: 'https://img.youtube.com/vi/UKXcCcbdZ-I/maxresdefault.jpg',
        channel: 'Bon Appétit',
        views: 3200000,
        duration: '15:45',
        description: 'Learn to make authentic Italian pasta with traditional techniques',
        likes: 125000,
        category: 'food'
      },
      {
        title: 'Epic Mountain Bike Adventure in the Swiss Alps',
        thumbnail: 'https://img.youtube.com/vi/yKP7jQknGjs/maxresdefault.jpg',
        channel: 'Red Bull',
        views: 4500000,
        duration: '8:22',
        description: 'Breathtaking mountain biking through stunning Alpine landscapes',
        likes: 180000,
        category: 'sports'
      },
      {
        title: 'Understanding Quantum Computing in Simple Terms',
        thumbnail: 'https://img.youtube.com/vi/JhHMJCUmq28/maxresdefault.jpg',
        channel: 'Veritasium',
        views: 6800000,
        duration: '22:15',
        description: 'Breaking down quantum computing concepts for everyone',
        likes: 320000,
        category: 'science'
      },
      {
        title: 'Top 10 Hidden Gems to Visit in Japan',
        thumbnail: 'https://img.youtube.com/vi/AH_1D_cW48c/maxresdefault.jpg',
        channel: 'Abroad in Japan',
        views: 2100000,
        duration: '18:30',
        description: 'Discover amazing places in Japan beyond the tourist spots',
        likes: 98000,
        category: 'travel'
      },
      {
        title: 'Learning Piano: From Beginner to Intermediate in 30 Days',
        thumbnail: 'https://img.youtube.com/vi/F15UuRDCHOs/maxresdefault.jpg',
        channel: 'Piano Video Lessons',
        views: 1500000,
        duration: '45:12',
        description: 'Complete piano course for rapid skill development',
        likes: 67000,
        category: 'music'
      },
      {
        title: 'The Psychology Behind Successful Habits',
        thumbnail: 'https://img.youtube.com/vi/PZ7lDrwYdZc/maxresdefault.jpg',
        channel: 'TED-Ed',
        views: 5200000,
        duration: '6:45',
        description: 'Science-backed strategies for building lasting habits',
        likes: 245000,
        category: 'education'
      },
      {
        title: 'Building a Smart Home with Raspberry Pi',
        thumbnail: 'https://img.youtube.com/vi/j4PARV5zloY/maxresdefault.jpg',
        channel: 'ExplainingComputers',
        views: 890000,
        duration: '28:40',
        description: 'Complete guide to home automation using Raspberry Pi',
        likes: 42000,
        category: 'technology'
      },
      {
        title: 'Wildlife Photography: Capturing the Perfect Shot',
        thumbnail: 'https://img.youtube.com/vi/9No-FiEInLA/maxresdefault.jpg',
        channel: 'Mango Street',
        views: 750000,
        duration: '16:20',
        description: 'Professional tips for stunning wildlife photography',
        likes: 35000,
        category: 'photography'
      },
      {
        title: 'The Rise and Fall of Ancient Rome',
        thumbnail: 'https://img.youtube.com/vi/46ZXl-V4qwA/maxresdefault.jpg',
        channel: 'Historia Civilis',
        views: 3800000,
        duration: '35:15',
        description: 'Comprehensive overview of Roman civilization',
        likes: 156000,
        category: 'history'
      },
      {
        title: 'Meditation for Beginners: 10-Minute Daily Practice',
        thumbnail: 'https://img.youtube.com/vi/inpok4MKVLM/maxresdefault.jpg',
        channel: 'Headspace',
        views: 2800000,
        duration: '10:00',
        description: 'Simple meditation techniques for stress relief and focus',
        likes: 112000,
        category: 'wellness'
      },
      {
        title: 'Amazing Street Food Around the World',
        thumbnail: 'https://img.youtube.com/vi/v-RE7RUzjf8/maxresdefault.jpg',
        channel: 'Mark Wiens',
        views: 4200000,
        duration: '20:15',
        description: 'Exploring the best street food from different countries',
        likes: 195000,
        category: 'food'
      },
      {
        title: 'How SpaceX Lands Rockets Back on Earth',
        thumbnail: 'https://img.youtube.com/vi/4Ca6x4QbpoM/maxresdefault.jpg',
        channel: 'SpaceX',
        views: 8500000,
        duration: '5:30',
        description: 'The incredible engineering behind reusable rockets',
        likes: 425000,
        category: 'science'
      },
      {
        title: 'Learning Guitar: Master 5 Essential Chords',
        thumbnail: 'https://img.youtube.com/vi/BqQRP8XfIDg/maxresdefault.jpg',
        channel: 'JustinGuitar',
        views: 3100000,
        duration: '25:40',
        description: 'Beginner guitar lesson covering the most important chords',
        likes: 145000,
        category: 'music'
      },
      {
        title: 'Incredible Wildlife of the Amazon Rainforest',
        thumbnail: 'https://img.youtube.com/vi/hFZFjoX2cGg/maxresdefault.jpg',
        channel: 'National Geographic',
        views: 6700000,
        duration: '42:20',
        description: 'Documentary exploring the biodiversity of the Amazon',
        likes: 285000,
        category: 'nature'
      },
      {
        title: 'Building Your First Mobile App with React Native',
        thumbnail: 'https://img.youtube.com/vi/0-S5a0eXPoc/maxresdefault.jpg',
        channel: 'Programming with Mosh',
        views: 1900000,
        duration: '1:15:30',
        description: 'Complete React Native tutorial for beginners',
        likes: 89000,
        category: 'technology'
      },
      {
        title: 'The Art of Minimalist Interior Design',
        thumbnail: 'https://img.youtube.com/vi/w7ejDZ8SWv8/maxresdefault.jpg',
        channel: 'Architectural Digest',
        views: 2400000,
        duration: '14:25',
        description: 'Creating beautiful spaces with minimalist principles',
        likes: 98000,
        category: 'lifestyle'
      },
      {
        title: 'Extreme Sports: Base Jumping in Norway',
        thumbnail: 'https://img.youtube.com/vi/TWfph3iNC-k/maxresdefault.jpg',
        channel: 'GoPro',
        views: 5800000,
        duration: '7:45',
        description: 'Heart-stopping base jumping footage from Norwegian cliffs',
        likes: 245000,
        category: 'sports'
      },
      {
        title: 'Mastering Digital Art: Photoshop Painting Techniques',
        thumbnail: 'https://img.youtube.com/vi/U9VV2DAO5nA/maxresdefault.jpg',
        channel: 'Aaron Blaise',
        views: 1200000,
        duration: '38:15',
        description: 'Professional digital painting workflow and techniques',
        likes: 67000,
        category: 'art'
      },
      {
        title: 'The Science of Sleep: Why We Need Rest',
        thumbnail: 'https://img.youtube.com/vi/5MuIMqhT8DM/maxresdefault.jpg',
        channel: 'TED-Ed',
        views: 4500000,
        duration: '4:52',
        description: 'Understanding the biological importance of sleep',
        likes: 198000,
        category: 'science'
      },
      {
        title: 'Epic Drone Footage: Iceland from Above',
        thumbnail: 'https://img.youtube.com/vi/YoDh_gHDvkk/maxresdefault.jpg',
        channel: 'Beautiful Destinations',
        views: 3600000,
        duration: '6:30',
        description: 'Breathtaking aerial views of Iceland\'s landscapes',
        likes: 156000,
        category: 'travel'
      },
      {
        title: 'Cryptocurrency Explained: Bitcoin vs Ethereum',
        thumbnail: 'https://img.youtube.com/vi/1YyAzVmP9xQ/maxresdefault.jpg',
        channel: 'Coin Bureau',
        views: 2200000,
        duration: '18:45',
        description: 'Understanding the differences between major cryptocurrencies',
        likes: 87000,
        category: 'finance'
      },
      {
        title: 'Morning Routine of Successful People',
        thumbnail: 'https://img.youtube.com/vi/gA8xki3eEts/maxresdefault.jpg',
        channel: 'Matt D\'Avella',
        views: 3400000,
        duration: '8:15',
        description: 'How top performers start their day for maximum productivity',
        likes: 142000,
        category: 'lifestyle'
      },
      {
        title: 'iPhone 15 Pro Max Review: Is It Worth the Upgrade?',
        thumbnail: 'https://img.youtube.com/vi/XHTrLYShBRQ/maxresdefault.jpg',
        channel: 'Marques Brownlee',
        views: 8900000,
        duration: '12:30',
        description: 'Complete review of Apple\'s latest flagship smartphone',
        likes: 456000,
        category: 'technology'
      },
      {
        title: 'Gordon Ramsay Teaches Perfect Scrambled Eggs',
        thumbnail: 'https://img.youtube.com/vi/PUP7U5vTMM0/maxresdefault.jpg',
        channel: 'Gordon Ramsay',
        views: 12500000,
        duration: '3:45',
        description: 'Master chef reveals the secret to creamy scrambled eggs',
        likes: 625000,
        category: 'food'
      },
      {
        title: 'Learning Python in 2024: Complete Roadmap',
        thumbnail: 'https://img.youtube.com/vi/rfscVS0vtbw/maxresdefault.jpg',
        channel: 'freeCodeCamp',
        views: 5600000,
        duration: '4:26:52',
        description: 'Full Python programming course from beginner to advanced',
        likes: 298000,
        category: 'education'
      },
      {
        title: 'Cristiano Ronaldo: Greatest Goals Compilation',
        thumbnail: 'https://img.youtube.com/vi/gCzkaX2DL7w/maxresdefault.jpg',
        channel: 'ESPN FC',
        views: 15200000,
        duration: '10:25',
        description: 'Most incredible goals scored by the football legend',
        likes: 785000,
        category: 'sports'
      },
      {
        title: 'Building a $10,000 Gaming PC in 2024',
        thumbnail: 'https://img.youtube.com/vi/v7MYOpFONCU/maxresdefault.jpg',
        channel: 'Linus Tech Tips',
        views: 4800000,
        duration: '22:15',
        description: 'Ultimate gaming setup with the latest high-end components',
        likes: 234000,
        category: 'technology'
      },
      {
        title: 'Taylor Swift - Anti-Hero (Official Music Video)',
        thumbnail: 'https://img.youtube.com/vi/b1kbLWvqugk/maxresdefault.jpg',
        channel: 'Taylor Swift',
        views: 89500000,
        duration: '4:03',
        description: 'Official music video from the Midnights album',
        likes: 2100000,
        category: 'music'
      },
      {
        title: 'Day in the Life of a Software Engineer at Google',
        thumbnail: 'https://img.youtube.com/vi/mgBgtTGNIjM/maxresdefault.jpg',
        channel: 'TechLead',
        views: 2800000,
        duration: '15:40',
        description: 'Behind the scenes at one of the world\'s top tech companies',
        likes: 125000,
        category: 'lifestyle'
      },
      {
        title: 'Marvel Studios Avengers: Secret Wars - Official Trailer',
        thumbnail: 'https://img.youtube.com/vi/G4S_f3HuF0U/maxresdefault.jpg',
        channel: 'Marvel Entertainment',
        views: 45600000,
        duration: '2:28',
        description: 'First look at the highly anticipated Marvel movie',
        likes: 1800000,
        category: 'entertainment'
      },
      {
        title: 'How to Invest $1000 for Beginners in 2024',
        thumbnail: 'https://img.youtube.com/vi/fwe4ql_ldu8/maxresdefault.jpg',
        channel: 'Graham Stephan',
        views: 1900000,
        duration: '16:20',
        description: 'Smart investment strategies for new investors',
        likes: 89000,
        category: 'finance'
      },
      {
        title: 'Exploring Tokyo: Hidden Local Spots Tourists Never See',
        thumbnail: 'https://img.youtube.com/vi/s-EqFADNzNA/maxresdefault.jpg',
        channel: 'Tokyo Lens',
        views: 3200000,
        duration: '19:35',
        description: 'Authentic Tokyo experiences away from the crowds',
        likes: 156000,
        category: 'travel'
      }
    ];
    
    await Video.insertMany(sampleVideos);
    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// 404 handler
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    url: req.originalUrl,
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /api/test-db',
      'POST /api/register',
      'POST /api/login',
      'GET /api/users'
    ]
  });
});

// MongoDB connection and server start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('Available routes:');
      console.log('- GET /');
      console.log('- GET /health');
      console.log('- GET /api/test-db');
      console.log('- POST /api/register');
      console.log('- POST /api/login');
      console.log('- GET /api/users');
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });