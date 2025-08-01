import express from 'express';
import Resume from '../models/resume.model.js';
import Assessment from '../models/assessment.model.js';
import { assessInterview } from '../utils/geminiAgent.js';

const router = express.Router();

// Route to add a new assessment
router.post('/add', async (req, res) => {
    const { resumeId, qa, userId } = req.body;

    if (!resumeId || !qa || !Array.isArray(qa) || !userId) {
        return res.status(400).json({ error: 'resumeId, qa (array), and userId are required' });
    }

    try {
        const resumeDoc = await Resume.findById(resumeId);
        if (!resumeDoc) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        const assessment = await assessInterview(resumeDoc.content, qa);

        const savedAssessment = await Assessment.create({
            userId,
            resumeId,
            resumeContent: resumeDoc.content,
            assessment,
            qa,
        });

        res.json({ success: true, assessment: savedAssessment });
    } catch (err) {
        console.error('Error adding assessment:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to get all assessments by a userId
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const assessments = await Assessment.find({ userId }).sort({ createdAt: -1 });
        res.json({ assessments });
    } catch (error) {
        console.error('Error fetching assessments:', error);
        res.status(500).json({ error: 'Failed to fetch assessments' });
    }
});

export default router;
