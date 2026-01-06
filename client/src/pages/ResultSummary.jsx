import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Home } from 'lucide-react';

const ResultSummary = () => {
    // For MVP we might just use state passed from navigate, but getting from ID is more robust if we implemented a fetch.
    // Since I didn't make a specific GET /result/:id public endpoint (only admin view), I'll rely on state passed navigation first, 
    // or generic "Thank you" page.
    // However, I updated endpoint to return result, so I can use location.state.

    const location = useLocation();
    const navigate = useNavigate();
    const result = location.state?.result;

    if (!result) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
                <h1 className="text-2xl font-bold text-gray-800">No Result Found</h1>
                <button onClick={() => navigate('/')} className="text-indigo-600 underline">Return Home</button>
            </div>
        )
    }

    const percentage = Math.round((result.score / result.totalPoints) * 100) || 0;

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-center">
                <div className={`p-8 ${percentage >= 70 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <div className="flex justify-center mb-4">
                        {percentage >= 70 ?
                            <CheckCircle className="w-16 h-16 text-emerald-500" /> :
                            <XCircle className="w-16 h-16 text-red-500" />
                        }
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Test Completed</h1>
                    <p className="text-gray-500">Thank you, {result.studentName}</p>
                </div>

                <div className="p-8">
                    <div className="mb-8">
                        <span className="text-6xl font-extrabold text-gray-900">{result.score}</span>
                        <span className="text-gray-400 text-xl font-medium">/ {result.totalPoints}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500 bg-gray-50 rounded-lg p-4 mb-8">
                        <span>Tab Switches Detected:</span>
                        <span className={`font-bold ${result.logs.tabSwitches > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {result.logs.tabSwitches}
                        </span>
                    </div>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                    >
                        <Home size={18} /> Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultSummary;
