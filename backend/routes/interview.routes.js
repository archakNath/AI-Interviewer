import express from 'express';
import Resume from '../models/resume.model.js'; // adjust path if needed
import { generateInterviewQuestions, assessInterview } from '../utils/geminiAgent.js';
import Assessment from '../models/assessment.model.js';

const router = express.Router();

router.post('/questions', async (req, res) => {
  const { resumeId, duration } = req.body;

  if (!resumeId || !duration) {
    return res.status(400).json({ error: 'resumeId and duration are required' });
  }

  try {
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const questions = await generateInterviewQuestions(resume.content, duration);

    res.json({ questions });
  } catch (err) {
    console.error('Error generating interview questions:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/assessment', async (req, res) => {
  const { resumeId, qa, userId } = req.body;

  if (!resumeId || !qa || !Array.isArray(qa) || !userId) {
    return res.status(400).json({ error: 'resumeId, qa (array), and userId are required' });
  }

  try {
    // 1. Fetch the resume from DB
    const resumeDoc = await Resume.findById(resumeId);
    if (!resumeDoc) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const resumeContent = resumeDoc.content;

    // 2. Perform AI assessment
    const assessmentResult = await assessInterview(resumeContent, qa);

    // 3. Save the result in the database
    const assessmentDoc = new Assessment({
      userId,
      resumeId,
      resumeContent,
      qa,
      assessmentDetails: assessmentResult,
      createdAt: new Date()
    });

    await assessmentDoc.save();

    // 4. Send response
    res.json({ assessment: assessmentResult });

  } catch (err) {
    console.error('Error assessing interview:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
