const express = require('express');
const router = express.Router();
const { Test, AccessCode, Result } = require('../models');

// Verify Access Code
router.post('/verify-code', async (req, res) => {
    try {
        const { code } = req.body;
        const accessCode = await AccessCode.findOne({ code, isUsed: false });

        if (!accessCode) {
            return res.status(404).json({ message: 'Invalid or used code' });
        }

        // Check expiration
        if (accessCode.expiresAt && new Date() > accessCode.expiresAt) {
            return res.status(400).json({ message: 'Code expired' });
        }

        const test = await Test.findById(accessCode.testId).select('-questions.correctAnswer'); // Don't send correct answers to client
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        res.json({ test, accessCode: code });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Submit Test
router.post('/submit', async (req, res) => {
    try {
        const { accessCode, studentName, studentAnswers, tabSwitches } = req.body;

        const validCode = await AccessCode.findOne({ code: accessCode, isUsed: false });
        if (!validCode) {
            return res.status(400).json({ message: 'Invalid code' });
        }

        const test = await Test.findById(validCode.testId);
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Calculate Score
        let score = 0;
        let totalPoints = 0;
        const gradedAnswers = [];

        test.questions.forEach((q) => {
            totalPoints += q.points;
            const submitted = studentAnswers.find(a => a.questionId === q._id.toString());
            const isCorrect = submitted && submitted.answer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();

            if (isCorrect) score += q.points;

            gradedAnswers.push({
                questionId: q._id,
                studentAnswer: submitted ? submitted.answer : '',
                isCorrect
            });
        });

        // Save Result
        const result = new Result({
            studentName,
            testId: test._id,
            accessCode,
            score,
            totalPoints,
            answers: gradedAnswers,
            logs: {
                tabSwitches,
                endTime: new Date()
            }
        });

        await result.save();

        // Mark code as used
        validCode.isUsed = true;
        await validCode.save();

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
