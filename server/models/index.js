const mongoose = require('mongoose');

// Admin Schema
const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Simple password for MVP
});

// Test Schema
const testSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    durationMinutes: { type: Number, default: 60 },
    questions: [{
        type: { type: String, enum: ['multiple-choice', 'true-false', 'short-answer'], required: true },
        questionText: { type: String, required: true },
        mediaUrl: { type: String }, // For image or video
        mediaType: { type: String, enum: ['image', 'video', 'none'], default: 'none' },
        options: [{ type: String }], // For MC
        correctAnswer: { type: String, required: true },
        points: { type: Number, default: 1 }
    }],
    createdAt: { type: Date, default: Date.now }
});

// Access Code Schema
const accessCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    isUsed: { type: Boolean, default: false },
    generatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }
});

// Result Schema
const resultSchema = new mongoose.Schema({
    studentName: { type: String, required: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    accessCode: { type: String, required: true },
    score: { type: Number, required: true },
    totalPoints: { type: Number, required: true },
    answers: [{
        questionId: { type: mongoose.Schema.Types.ObjectId },
        studentAnswer: { type: String },
        isCorrect: { type: Boolean }
    }],
    logs: {
        tabSwitches: { type: Number, default: 0 },
        startTime: { type: Date },
        endTime: { type: Date }
    },
    submittedAt: { type: Date, default: Date.now }
});

module.exports = {
    Admin: mongoose.model('Admin', adminSchema),
    Test: mongoose.model('Test', testSchema),
    AccessCode: mongoose.model('AccessCode', accessCodeSchema),
    Result: mongoose.model('Result', resultSchema)
};
