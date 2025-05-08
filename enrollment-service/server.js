require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Enrollment model
const Enrollment = mongoose.model('Enrollment', new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  enrolledAt: { type: Date, default: Date.now }
}));

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to Enrollment Service');
});

app.get('/enrollments', async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('studentId')
      .populate('courseId');
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/enrollments', async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    if (!studentId || !courseId) {
      return res.status(400).json({ error: 'Both studentId and courseId are required' });
    }
    
    const enrollment = new Enrollment({ studentId, courseId });
    await enrollment.save();
    res.status(201).json(enrollment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log(`Enrollment service running on port ${port}`);
});