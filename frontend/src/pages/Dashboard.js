import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, CheckCircle, XCircle, TrendingUp, Vote, Brain, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalVoters: 0,
        votedCount: 0,
        notVotedCount: 0,
        votingPercentage: 0,
        recentVotes: []
    });
    const [anomalies, setAnomalies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDetecting, setIsDetecting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [statsResponse, anomaliesResponse] = await Promise.all([
                // axios.get('http://localhost:5000/api/dashboard/stats'),
                axios.get('http://localhost:5000/api/data/dashboard/stats'),
                axios.get('http://localhost:5000/api/data/ai/anomalies')
            ]);
            
            setStats(statsResponse.data);
            setAnomalies(anomaliesResponse.data);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
        setIsLoading(false);
    };

    const runAIDetection = async () => {
        setIsDetecting(true);
        try {
            await axios.post('http://localhost:5000/api/data/ai/detect-anomalies');
            await loadData(); // Reload data after detection
        } catch (error) {
            console.error('AI detection failed:', error);
        }
        setIsDetecting(false);
    };

    const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <div className={`p-4 rounded-full ${color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
            </div>
        </motion.div>
    );

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-blue-50 via-white to-green-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="text-center mb-12">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-saffron via-white to-green flex items-center justify-center shadow-lg border-4 border-white">
                        <TrendingUp className="w-8 h-8 text-navy" />
                    </div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-3"
                    >
                        <span className="text-navy">Election</span>{" "}
                        <span className="text-saffron">Dashboard</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-600"
                    >
                        Real-time voting analytics and AI-powered fraud detection
                    </motion.p>
                </header>

                {/* AI Detection Button */}
                <div className="text-center mb-8">
                    <button
                        onClick={runAIDetection}
                        disabled={isDetecting}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                    >
                        {isDetecting ? (
                            <>
                                <Brain className="w-5 h-5 mr-2 inline animate-pulse" />
                                AI Analyzing...
                            </>
                        ) : (
                            <>
                                <Brain className="w-5 h-5 mr-2 inline" />
                                Run AI Fraud Detection
                            </>
                        )}
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard
                        title="Total Registered Voters"
                        value={stats.totalVoters}
                        icon={Users}
                        color="bg-blue-500"
                        subtitle="In system"
                    />
                    <StatCard
                        title="Votes Cast"
                        value={stats.votedCount}
                        icon={CheckCircle}
                        color="bg-green"
                        subtitle="Successfully recorded"
                    />
                    <StatCard
                        title="Not Voted"
                        value={stats.notVotedCount}
                        icon={XCircle}
                        color="bg-saffron"
                        subtitle="Remaining"
                    />
                    <StatCard
                        title="Turnout Percentage"
                        value={`${stats.votingPercentage}%`}
                        icon={TrendingUp}
                        color="bg-purple-500"
                        subtitle="Current participation"
                    />
                </div>

                {/* Progress Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Vote className="w-5 h-5 text-navy" />
                            Voting Progress
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Overall Progress</span>
                                <span>{stats.votingPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className="bg-gradient-to-r from-saffron to-green h-4 rounded-full transition-all duration-1000"
                                    style={{ width: `${stats.votingPercentage}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>{stats.votedCount} voted</span>
                                <span>{stats.notVotedCount} remaining</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Votes */}
                    {stats.recentVotes.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green" />
                                    Recent Votes
                                </h3>
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {stats.recentVotes.map((voter, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-semibold text-gray-800">{voter.full_name}</p>
                                                <p className="text-sm text-gray-500">{voter.constituency}</p>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {new Date(voter.voting_timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* AI Anomaly Detection Results */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                AI Detected Anomalies ({anomalies.length})
                            </h3>
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {anomalies.length > 0 ? (
                                    anomalies.map((anomaly, index) => (
                                        <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold text-gray-800">{anomaly.booth_name}</h4>
                                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                                    {anomaly.detection_type}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 mb-2">{anomaly.details}</p>
                                            {anomaly.confidence_score && (
                                                <p className="text-xs text-gray-500">
                                                    AI Confidence: {Math.round(anomaly.confidence_score * 100)}%
                                                </p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <p>No anomalies detected.</p>
                                        <p className="text-sm">Run AI detection to analyze patterns.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;