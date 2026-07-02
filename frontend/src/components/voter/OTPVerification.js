import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Clock, Send } from 'lucide-react';

const OTPVerification = ({ voterData, phoneNumber, smsStatus, onVerify, onBack, isLoading }) => {
    const [otp, setOtp] = useState('');
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onVerify(otp);
    };

    const message = voterData?.message || smsStatus?.message || 'Enter the OTP sent to your phone';
    const maskedPhone = phoneNumber ? `******${String(phoneNumber).slice(-4)}` : '';

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-md mx-auto"
        >
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-gray-200">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">OTP Verification</h2>
                    <p className="text-gray-600 mt-2">{message}</p>
                    {maskedPhone && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-2">
                            <Send className="w-4 h-4" />
                            {maskedPhone}
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                            className="w-full text-center text-2xl tracking-widest px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>

                    {/* Timer */}
                    <div className="text-center bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800 flex items-center justify-center gap-2">
                            <Clock className="w-4 h-4" />
                            OTP expires in: 
                            <span className={`font-semibold ${timeLeft < 60 ? 'text-red-500' : ''}`}>
                                {formatTime(timeLeft)}
                            </span>
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex-1 h-12 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || otp.length !== 6 || timeLeft === 0}
                            className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <Shield className="w-4 h-4" />
                                    Verify
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default OTPVerification;
