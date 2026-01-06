const express = require('express');
const router = express.Router();
const { Test, AccessCode, Result } = require('../models');
// const { Admin } = require('../models'); // Auth middleware could rely on this later

// Middleware to mock admin auth for MVP
const checkAdmin = (req, res, next) => {
    // In a real app, verify JWT or session here
    // For now, accept a header or just proceed
    // if (!req.headers['x-admin-auth']) return res.status(401).json({ message: 'Unauthorized' });
    next();
};

// Create a new test
router.post('/tests', checkAdmin, async (req, res) => {
    try {
        const { title, description, durationMinutes, questions } = req.body;
        const test = new Test({ title, description, durationMinutes, questions });
        await test.save();
        res.status(201).json(test);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET all tests
router.get('/tests', checkAdmin, async (req, res) => {
    try {
        const tests = await Test.find().select('-questions.correctAnswer');
        res.json(tests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Generate Access Code
router.post('/generate-code', checkAdmin, async (req, res) => {
    try {
        const { testId, expiresInHours } = req.body;

        // Generate a random 6-character code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Optional expiration
        let expiresAt = null;
        if (expiresInHours) {
            expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + expiresInHours);
        }

        const accessCode = new AccessCode({
            code,
            testId,
            expiresAt
        });

        await accessCode.save();
        res.status(201).json(accessCode);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Results for a Test
router.get('/results/:testId', checkAdmin, async (req, res) => {
    try {
        const results = await Result.find({ testId: req.params.testId }).sort({ submittedAt: -1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
