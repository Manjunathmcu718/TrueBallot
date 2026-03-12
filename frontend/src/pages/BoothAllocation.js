import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Trash2, RefreshCw, Building, AlertCircle, Sparkles, Users, TrendingUp, CheckCircle } from 'lucide-react';
import axios from 'axios';

const BoothAllocationPage = () => {
    const [mappings, setMappings] = useState([]);
    const [booths, setBooths] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    
    // Auto-generation states
    const [isAutoGenerating, setIsAutoGenerating] = useState(false);
    const [autoGenResult, setAutoGenResult] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [newMapping, setNewMapping] = useState({
        booth_id: '',
        booth_name: '',
        locality_names: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [mappingsRes, boothsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/booth-allocation/mappings'),
                axios.get('http://localhost:5000/api/admin/booths')
            ]);
            setMappings(mappingsRes.data.mappings);
            setBooths(boothsRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
            setError('Failed to load booth data');
        }
        setIsLoading(false);
    };

    // NEW: Auto-generate booth allocations from voters
    const handleAutoGenerate = async () => {
        if (!window.confirm('This will analyze all voters and auto-create booth-to-locality mappings. Existing mappings may be updated. Continue?')) {
            return;
        }

        setIsAutoGenerating(true);
        setError('');
        setSuccess('');
        setAutoGenResult(null);

        try {
            const response = await axios.post('http://localhost:5000/api/booth-allocation/auto-generate');
            
            if (response.data.success) {
                setAutoGenResult(response.data);
                setSuccess(response.data.message);
                await loadData(); // Reload mappings
                
                // Clear success message after 8 seconds
                setTimeout(() => {
                    setSuccess('');
                    setAutoGenResult(null);
                }, 8000);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to auto-generate booth allocations. Make sure you have voters in the database.');
        }

        setIsAutoGenerating(false);
    };

    const handleCreateMapping = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        try {
            // Convert comma-separated string to array
            const localityArray = newMapping.locality_names
                .split(',')
                .map(name => name.trim())
                .filter(name => name.length > 0);
            
            if (localityArray.length === 0) {
                setError('Please enter at least one locality name');
                return;
            }
            
            await axios.post('http://localhost:5000/api/booth-allocation/create-mapping', {
                booth_id: newMapping.booth_id,
                booth_name: newMapping.booth_name,
                locality_names: localityArray
            });
            
            setSuccess('Mapping created successfully!');
            setNewMapping({ booth_id: '', booth_name: '', locality_names: '' });
            setShowAddForm(false);
            loadData();
            
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError('Error creating mapping: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleDeleteMapping = async (boothId) => {
        if (window.confirm('Are you sure you want to delete this mapping?')) {
            try {
                await axios.delete(`http://localhost:5000/api/booth-allocation/delete-mapping/${boothId}`);
                setSuccess('Mapping deleted successfully');
                loadData();
                setTimeout(() => setSuccess(''), 3000);
            } catch (error) {
                setError('Error deleting mapping: ' + (error.response?.data?.error || error.message));
            }
        }
    };

    return (
        <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="text-center mb-12">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg border-4 border-white">
                        <MapPin className="w-8 h-8 text-white" />
                    </div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-3"
                    >
                        <span className="text-blue-600">Smart Booth</span>{' '}
                        <span className="text-indigo-600">Allocation</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-700"
                    >
                        AI-powered locality-to-booth mapping from voter data
                    </motion.p>
                </header>

                {/* Success/Error Messages */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg"
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <p className="text-green-800 font-medium">{success}</p>
                            </div>
                        </motion.div>
                    )}

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg"
                        >
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <p className="text-red-800 font-medium">{error}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Auto-Generation Result */}
                <AnimatePresence>
                    {autoGenResult && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="mb-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg border-2 border-purple-200 p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-purple-900 flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-purple-600" />
                                    Auto-Generation Complete!
                                </h3>
                                <button
                                    onClick={() => setAutoGenResult(null)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <Users className="w-6 h-6 text-blue-600 mb-2" />
                                    <p className="text-sm text-gray-600">Voters Analyzed</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {autoGenResult.total_voters_analyzed}
                                    </p>
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <MapPin className="w-6 h-6 text-indigo-600 mb-2" />
                                    <p className="text-sm text-gray-600">Localities Found</p>
                                    <p className="text-2xl font-bold text-indigo-600">
                                        {autoGenResult.total_localities_found}
                                    </p>
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <Plus className="w-6 h-6 text-green-600 mb-2" />
                                    <p className="text-sm text-gray-600">Booths Created</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {autoGenResult.booths_created}
                                    </p>
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <RefreshCw className="w-6 h-6 text-orange-600 mb-2" />
                                    <p className="text-sm text-gray-600">Booths Updated</p>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {autoGenResult.booths_updated}
                                    </p>
                                </div>
                            </div>

                            {autoGenResult.locality_summary && (
                                <div className="bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-purple-600" />
                                        Top Localities Detected:
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(autoGenResult.locality_summary).slice(0, 8).map(([locality, count]) => (
                                            <span
                                                key={locality}
                                                className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full border border-purple-200"
                                            >
                                                {locality} ({count})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Info Box */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-lg">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="font-semibold text-blue-800">How Smart Allocation Works:</p>
                            <p className="text-sm text-blue-700 mt-1">
                                Click "Auto-Generate" to analyze all voter addresses and automatically create booth mappings. 
                                The system groups 3-4 nearby localities per booth. When adding voters, their booth is auto-assigned based on address.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Locality-Booth Mappings ({mappings.length})
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={loadData}
                            disabled={isLoading}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        
                        {/* Auto-Generate Button */}
                        <button
                            onClick={handleAutoGenerate}
                            disabled={isAutoGenerating}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAutoGenerating ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Analyzing Voters...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Auto-Generate from Voters
                                </>
                            )}
                        </button>
                        
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {showAddForm ? 'Cancel' : 'Add Manually'}
                        </button>
                    </div>
                </div>

                {/* Add Mapping Form */}
                <AnimatePresence>
                    {showAddForm && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20, height: 0 }}
                            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6 overflow-hidden"
                        >
                            <h3 className="text-xl font-bold mb-4">Create Manual Mapping</h3>
                            <form onSubmit={handleCreateMapping} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Booth
                                        </label>
                                        <select
                                            value={newMapping.booth_id}
                                            onChange={(e) => {
                                                const selectedBooth = booths.find(b => b.booth_number === e.target.value);
                                                setNewMapping({
                                                    ...newMapping,
                                                    booth_id: e.target.value,
                                                    booth_name: selectedBooth?.booth_name || ''
                                                });
                                            }}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">-- Select Booth --</option>
                                            {booths.map(booth => (
                                                <option key={booth._id} value={booth.booth_number}>
                                                    {booth.booth_name} ({booth.booth_number})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Locality Names (comma-separated)
                                        </label>
                                        <input
                                            type="text"
                                            value={newMapping.locality_names}
                                            onChange={(e) => setNewMapping({...newMapping, locality_names: e.target.value})}
                                            placeholder="e.g., Keshav Nagar, Gandhi Nagar, Mayur Vihar"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Enter 3-4 nearby areas separated by commas
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700"
                                    >
                                        Create Mapping
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mappings List */}
                <div className="space-y-4">
                    {isLoading && mappings.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                            <RefreshCw className="w-8 h-8 mx-auto mb-4 text-indigo-600 animate-spin" />
                            <p className="text-gray-500">Loading booth mappings...</p>
                        </div>
                    ) : mappings.length > 0 ? (
                        mappings.map((mapping, idx) => (
                            <motion.div
                                key={mapping._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                                                <Building className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800">
                                                    {mapping.booth_name}
                                                </h3>
                                                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full font-medium inline-block mt-1">
                                                    {mapping.booth_id}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-1">
                                            <p className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-indigo-600" />
                                                Covered Localities ({mapping.locality_names.length}):
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {mapping.locality_names.map((locality, locIdx) => (
                                                    <span
                                                        key={locIdx}
                                                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-200"
                                                    >
                                                        {locality}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteMapping(mapping.booth_id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete mapping"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-200">
                            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-600 font-medium mb-2">No Booth Mappings Yet</p>
                            <p className="text-sm text-gray-500 mb-6">
                                Get started by auto-generating from voter data or creating manually
                            </p>
                            <button
                                onClick={handleAutoGenerate}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700"
                            >
                                <Sparkles className="w-5 h-5" />
                                Auto-Generate from Voters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BoothAllocationPage;