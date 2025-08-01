import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: [true, 'Filename is required'],
        trim: true,
        maxlength: [255, 'Filename cannot exceed 255 characters']
    },
    content: {
        type: String,
        required: [true, 'Resume content is required'],
        trim: true
    },
    userId: {
        type: String,
        required: [true, 'User ID is required'],
        trim: true
    }
}, {
    timestamps: true // This automatically adds createdAt and updatedAt fields
});

// Index for faster queries
resumeSchema.index({ userId: 1, createdAt: -1 });

// Virtual for content length
resumeSchema.virtual('contentLength').get(function() {
    return this.content ? this.content.length : 0;
});

// Ensure virtual fields are serialized
resumeSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Resume', resumeSchema);