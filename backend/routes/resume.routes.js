import express from 'express';
import multer from 'multer';
import Resume from '../models/resume.model.js';
import mammoth from 'mammoth';
import fs from 'fs-extra';
import path from 'path';
import pdfUtil from 'pdf-to-text';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];

function allowedFile(filename) {
    return ALLOWED_EXTENSIONS.includes(path.extname(filename).toLowerCase());
}

function extractPDFTextFromPath(filePath) {
    return new Promise((resolve, reject) => {
        pdfUtil.pdfToText(filePath, (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    });
}

// PDF text extraction using pdf-lib (lightweight alternative)
async function extractPDFText(buffer) {
    try {
        // Option 1: Use pdf-lib for basic text extraction
        const { PDFDocument } = await import('pdf-lib');
        const pdfDoc = await PDFDocument.load(buffer);
        const pages = pdfDoc.getPages();
        
        let text = '';
        // Note: pdf-lib doesn't directly extract text, so we'll use a fallback
        // For production, consider using a service like AWS Textract or Google Document AI
        
        // Fallback: Try pdf-parse with error handling
        try {
            const pdfParse = (await import('pdf-parse')).default;
            const result = await pdfParse(buffer);
            text = result.text;
        } catch (parseError) {
            console.warn('pdf-parse failed, using fallback method');
            // Fallback: Return a message indicating manual processing needed
            text = '[PDF content - text extraction temporarily unavailable. Please ensure the PDF contains selectable text.]';
        }
        
        return text;
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw new Error('Failed to extract text from PDF');
    }
}

// Upload resume WITH text extraction
router.post('/upload', upload.single('resume'), async (req, res) => {
    let filePath = null;

    try {
        const { userId } = req.body;

        if (!req.file || !userId) {
            return res.status(400).json({ error: 'Missing file or userId' });
        }

        filePath = req.file.path;
        const originalName = req.file.originalname;
        const fileExt = path.extname(originalName).toLowerCase();

        if (!allowedFile(originalName)) {
            await fs.remove(filePath);
            return res.status(400).json({ error: 'Unsupported file type. Only PDF and DOCX are allowed.' });
        }

        let textContent = '';

        if (fileExt === '.pdf') {
            textContent = await extractPDFTextFromPath(filePath);
        } else if (fileExt === '.docx') {
            const fileBuffer = await fs.readFile(filePath);
            const result = await mammoth.extractRawText({ buffer: fileBuffer });
            textContent = result.value;
        } else {
            await fs.remove(filePath);
            return res.status(400).json({ error: 'Unsupported file extension.' });
        }

        // Clean up temp file
        await fs.remove(filePath);
        filePath = null;

        if (!textContent || textContent.trim().length === 0) {
            return res.status(400).json({ 
                error: 'No text content could be extracted. Ensure the file contains readable text.' 
            });
        }

        const newResume = new Resume({
            filename: originalName,
            content: textContent.trim(),
            userId,
        });

        await newResume.save();

        return res.status(201).json({
            message: 'Resume uploaded and processed successfully',
            resume: {
                id: newResume._id,
                filename: newResume.filename,
                userId: newResume.userId,
                uploadDate: newResume.createdAt,
                contentLength: textContent.length
            },
        });

    } catch (error) {
        console.error('Error in /upload:', error);
        if (filePath) {
            try {
                await fs.remove(filePath);
            } catch (cleanupError) {
                console.error('Error cleaning up temp file:', cleanupError);
            }
        }

        return res.status(500).json({ 
            error: 'Failed to process the resume file.',
            details: error.message 
        });
    }
});

// Get all resumes for a user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        const resumes = await Resume.find({ userId }).select('filename createdAt _id');
        res.json({
            resumes,
            count: resumes.length
        });
    } catch (err) {
        console.error('Error fetching resumes:', err);
        res.status(500).json({ error: 'Failed to fetch resumes' });
    }
});

// Get specific resume content
router.get('/:userId/:resumeId', async (req, res) => {
    try {
        const { userId, resumeId } = req.params;
        
        const resume = await Resume.findOne({ _id: resumeId, userId });
        
        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }
        
        res.json(resume);
    } catch (err) {
        console.error('Error fetching resume:', err);
        res.status(500).json({ error: 'Failed to fetch resume' });
    }
});

// Update resume details (filename only, content remains unchanged)
router.put('/:userId/:resumeId', async (req, res) => {
    try {
        const { userId, resumeId } = req.params;
        const { filename } = req.body;
        
        if (!filename || filename.trim().length === 0) {
            return res.status(400).json({ error: 'Filename is required' });
        }

        // Validate filename length
        if (filename.length > 255) {
            return res.status(400).json({ error: 'Filename is too long (max 255 characters)' });
        }

        // Find and update the resume
        const updatedResume = await Resume.findOneAndUpdate(
            { _id: resumeId, userId },
            { 
                filename: filename.trim(),
                updatedAt: new Date()
            },
            { 
                new: true, // Return the updated document
                runValidators: true // Run mongoose validators
            }
        );
        
        if (!updatedResume) {
            return res.status(404).json({ error: 'Resume not found' });
        }
        
        res.json({
            message: 'Resume updated successfully',
            resume: {
                id: updatedResume._id,
                filename: updatedResume.filename,
                userId: updatedResume.userId,
                createdAt: updatedResume.createdAt,
                updatedAt: updatedResume.updatedAt
            }
        });
    } catch (err) {
        console.error('Error updating resume:', err);
        
        // Handle mongoose validation errors
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                error: 'Validation error',
                details: Object.values(err.errors).map(e => e.message)
            });
        }
        
        res.status(500).json({ error: 'Failed to update resume' });
    }
});

// Delete resume
router.delete('/:userId/:resumeId', async (req, res) => {
    try {
        const { userId, resumeId } = req.params;
        
        const result = await Resume.findOneAndDelete({ _id: resumeId, userId });
        
        if (!result) {
            return res.status(404).json({ error: 'Resume not found' });
        }
        
        res.json({ message: 'Resume deleted successfully' });
    } catch (err) {
        console.error('Error deleting resume:', err);
        res.status(500).json({ error: 'Failed to delete resume' });
    }
});

export default router;