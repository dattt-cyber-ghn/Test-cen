import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react';

const Home = () => {
    const [accessCode, setAccessCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleStartTest = async (e) => {
        e.preventDefault();
        if (!accessCode.trim()) return;

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/test/verify-code', { code: accessCode.trim().toUpperCase() });
            if (response.data) {
                navigate(`/test/${accessCode.trim().toUpperCase()}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid access code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100">
                <div className="flex justify-center mb-6">
                    <div className="bg-indigo-100 p-4 rounded-full">
                        <ShieldCheck className="w-12 h-12 text-indigo-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Secure Test Center</h1>
                <p className="text-center text-gray-500 mb-8">Enter your access code to begin your exam.</p>

                <form onSubmit={handleStartTest} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Access Code</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors uppercase tracking-widest font-mono text-center text-lg"
                                placeholder="XXXXXX"
                                maxLength={6}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center font-medium animate-pulse">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !accessCode}
                        className={`w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-semibold transition-all shadow-md hover:shadow-lg transform active:scale-95 ${loading || !accessCode
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                    >
                        {loading ? 'Verifying...' : 'Start Test'}
                        {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <Link to="/admin" className="text-sm text-gray-400 hover:text-indigo-500 transition-colors">
                        Admin Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
