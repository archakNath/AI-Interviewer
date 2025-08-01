import mongoose from 'mongoose';

const AssessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Resume',
  },
  resumeContent: {
    type: String,
    required: true,
  },
  qa: {
    type: Array,
    required: true,
  },
  assessmentDetails: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Assessment = mongoose.model('Assessment', AssessmentSchema);
export default Assessment;
