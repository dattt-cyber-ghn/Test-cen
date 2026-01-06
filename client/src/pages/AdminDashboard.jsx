import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Users, ClipboardList, Trash2, Key, ChevronRight } from 'lucide-react';

const AdminDashboard = () => {
    const [tests, setTests] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTest, setNewTest] = useState({ title: '', description: '', questions: [] });
    // Initial simple question state for creation
    const [currentQuestion, setCurrentQuestion] = useState({
        type: 'multiple-choice',
        questionText: '',
        correctAnswer: '',
        options: ['', '', '', ''],
        points: 1
    });

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            const res = await api.get('/admin/tests');
            setTests(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddQuestion = () => {
        setNewTest({ ...newTest, questions: [...newTest.questions, { ...currentQuestion }] });
        // Reset current question
        setCurrentQuestion({
            type: 'multiple-choice',
            questionText: '',
            correctAnswer: '',
            options: ['', '', '', ''],
            points: 1
        });
    };

    const createTest = async () => {
        try {
            await api.post('/admin/tests', newTest);
            setShowCreateModal(false);
            setNewTest({ title: '', description: '', questions: [] });
            fetchTests();
        } catch (err) {
            alert('Failed to create test');
        }
    };

    const generateCode = async (testId) => {
        try {
            const res = await api.post('/admin/generate-code', { testId, expiresInHours: 24 });
            alert(`Access Code Generated: ${res.data.code}`);
        } catch (err) {
            alert('Error generating code');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <ClipboardList className="text-indigo-600" /> Test Management
                    </h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2 shadow-sm"
                    >
                        <Plus size={20} /> Create New Test
                    </button>
                </header>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tests.map(test => (
                        <div key={test._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{test.title}</h3>
                            <p className="text-gray-500 mb-4 h-12 overflow-hidden">{test.description || 'No description'}</p>
                            <div className="flex justify-between items-center text-sm text-gray-400 mb-6">
                                <span>{test.questions.length} Questions</span>
                                <span>{test.durationMinutes} mins</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => generateCode(test._id)}
                                    className="flex-1 bg-emerald-50 text-emerald-600 py-2 rounded-lg font-medium hover:bg-emerald-100 transition flex items-center justify-center gap-2"
                                >
                                    <Key size={16} /> Generate Code
                                </button>
                                {/* More Actions could go here */}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Simple Modal for MVP Test Creation */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
                            <h2 className="text-2xl font-bold mb-6">Create New Test</h2>
                            <div className="space-y-4">
                                <input
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Test Title"
                                    value={newTest.title}
                                    onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                                />
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Description"
                                    value={newTest.description}
                                    onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                                />

                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-4">Add Question ({newTest.questions.length})</h3>
                                    <input
                                        className="w-full border border-gray-300 rounded-lg p-3 mb-3"
                                        placeholder="Question Text"
                                        value={currentQuestion.questionText}
                                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                                    />

                                    <select
                                        className="w-full border border-gray-300 rounded-lg p-3 mb-3"
                                        value={currentQuestion.type}
                                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value })}
                                    >
                                        <option value="multiple-choice">Multiple Choice</option>
                                        <option value="true-false">True/False</option>
                                        <option value="short-answer">Short Answer</option>
                                    </select>

                                    {/* Only showing Multiple Choice options for MVP Simplicity in creation UI */}
                                    {currentQuestion.type === 'multiple-choice' && (
                                        <div className="space-y-2 mb-3">
                                            {currentQuestion.options.map((opt, idx) => (
                                                <input
                                                    key={idx}
                                                    className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                                                    placeholder={`Option ${idx + 1}`}
                                                    value={opt}
                                                    onChange={(e) => {
                                                        const newOpts = [...currentQuestion.options];
                                                        newOpts[idx] = e.target.value;
                                                        setCurrentQuestion({ ...currentQuestion, options: newOpts });
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <input
                                        className="w-full border border-gray-300 rounded-lg p-3 mb-3"
                                        placeholder="Correct Answer (Exact match)"
                                        value={currentQuestion.correctAnswer}
                                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                                    />

                                    <button
                                        onClick={handleAddQuestion}
                                        className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
                                    >
                                        + Add Question
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8 pt-4 border-t">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createTest}
                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                                >
                                    Save Test
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
