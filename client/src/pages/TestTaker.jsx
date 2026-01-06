import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { AlertTriangle, Clock, EyeOff, CheckCircle } from 'lucide-react';

const TestTaker = () => {
    const { accessCode } = useParams();
    const navigate = useNavigate();

    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [studentName, setStudentName] = useState('');
    const [started, setStarted] = useState(false);

    const [answers, setAnswers] = useState({}); // { questionId: answerString }
    const [tabSwitches, setTabSwitches] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0); // in seconds

    // Anti-cheat refs
    const hasWarnedRef = useRef(false);

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const res = await api.post('/test/verify-code', { code: accessCode });
                setTest(res.data.test);
                setTimeLeft(res.data.test.durationMinutes * 60);
            } catch (err) {
                alert('Invalid or Expired Code');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchTest();
    }, [accessCode, navigate]);

    // Tab Switching Monitor
    useEffect(() => {
        if (!started) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTabSwitches(prev => prev + 1);
                if (!hasWarnedRef.current) {
                    alert("WARNING: Tab switching is monitored! Please stay on this page.");
                    hasWarnedRef.current = true;
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [started]);

    // Timer
    useEffect(() => {
        if (!started || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(); // Auto submit
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [started, timeLeft]);

    const handleStart = (e) => {
        e.preventDefault();
        if (studentName.trim()) {
            setStarted(true);
        }
    };

    const handleAnswerChange = (qId, val) => {
        setAnswers(prev => ({ ...prev, [qId]: val }));
    };

    const handleSubmit = async () => {
        if (!window.confirm("Are you sure you want to submit?")) return;

        const formattedAnswers = Object.entries(answers).map(([key, val]) => ({
            questionId: key,
            answer: val
        }));

        try {
            const res = await api.post('/test/submit', {
                accessCode,
                studentName,
                studentAnswers: formattedAnswers,
                tabSwitches
            });
            navigate(`/results/${res.data._id}`, { state: { result: res.data } });
        } catch (err) {
            console.error(err);
            alert('Submission failed. Please try again.');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!test) return <div className="min-h-screen flex items-center justify-center">Test not found</div>;

    // Name Entry Screen
    if (!started) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                    <h1 className="text-2xl font-bold mb-2 text-gray-800">{test.title}</h1>
                    <p className="text-gray-500 mb-6">{test.description}</p>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-800">
                        <p className="font-bold flex items-center gap-2 mb-2"><AlertTriangle size={16} /> Exam Rules:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Duration: {test.durationMinutes} minutes</li>
                            <li>Tab switching is monitored and recorded.</li>
                            <li>Do not refresh the page.</li>
                        </ul>
                    </div>

                    <form onSubmit={handleStart}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Enter Your Full Name</label>
                        <input
                            required
                            className="w-full border border-gray-300 rounded-lg p-3 mb-6 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="John Doe"
                            value={studentName}
                            onChange={e => setStudentName(e.target.value)}
                        />
                        <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition">
                            Start Exam
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    // Test Interface
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Sticky Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-gray-800">{test.title}</h2>
                        <span className="text-sm text-gray-400">Student: {studentName}</span>
                    </div>
                    <div className={`font-mono text-xl font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-gray-700'} flex items-center gap-2`}>
                        <Clock size={20} />
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </header>

            {/* Tab Switch Warning Sticky */}
            {tabSwitches > 0 && (
                <div className="bg-red-500 text-white text-center text-sm py-2 font-medium flex justify-center items-center gap-2 animate-pulse">
                    <EyeOff size={16} /> Warning: You have switched tabs {tabSwitches} time(s). This activity is recorded.
                </div>
            )}

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
                {test.questions.map((q, idx) => (
                    <div key={q._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-indigo-50 text-indigo-600 text-sm font-bold px-3 py-1 rounded-full">
                                Question {idx + 1}
                            </span>
                            <span className="text-gray-400 text-sm">{q.points} Points</span>
                        </div>

                        <h3 className="text-lg font-medium text-gray-800 mb-6">{q.questionText}</h3>

                        {/* Simplified Media Rendering if URL exists */}
                        {/* {q.mediaUrl && <img src={q.mediaUrl} alt="Question Media" className="mb-4 rounded-lg max-h-64 object-contain" />} */}

                        <div className="space-y-3">
                            {q.type === 'multiple-choice' && q.options.map((opt, optIdx) => (
                                <label key={optIdx} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${answers[q._id] === opt ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input
                                        type="radio"
                                        name={q._id}
                                        value={opt}
                                        onChange={() => handleAnswerChange(q._id, opt)}
                                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="ml-3 text-gray-700">{opt}</span>
                                </label>
                            ))}

                            {q.type === 'true-false' && ['True', 'False'].map((opt) => (
                                <label key={opt} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${answers[q._id] === opt ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input
                                        type="radio"
                                        name={q._id}
                                        value={opt}
                                        onChange={() => handleAnswerChange(q._id, opt)}
                                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="ml-3 text-gray-700">{opt}</span>
                                </label>
                            ))}

                            {q.type === 'short-answer' && (
                                <textarea
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Type your answer here..."
                                    value={answers[q._id] || ''}
                                    onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                />
                            )}
                        </div>
                    </div>
                ))}

                <button
                    onClick={handleSubmit}
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                >
                    <CheckCircle /> Submit Exam
                </button>
            </div>
        </div>
    );
};

export default TestTaker;
