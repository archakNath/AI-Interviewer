import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/user.routes.js'; // Note: add `.js` extension for ES Modules
import resumeRoutes from './routes/resume.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import assessmentRoutes from './routes/assessment.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/assessments', assessmentRoutes);

// Sample route
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
