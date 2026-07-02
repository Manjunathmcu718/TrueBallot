import React, { useState, useEffect } from 'react';

export default function VoterAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('voted');

  useEffect(() => {
    fetch('http://localhost:5000/api/analysis/voter-categories')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center p-8">Loading analysis...</div>;
  if (!data) return <div className="text-center p-8 text-red-500">Failed to load analysis</div>;

  const tabs = [
    { key: 'voted', label: '✅ VOTED', count: data.voted.count, color: 'green' },
    { key: 'not_voted', label: '❌ NOT VOTED', count: data.not_voted.count, color: 'red' },
    { key: 'anomaly', label: '⚠️ ANOMALY', count: data.anomaly.count, color: 'yellow' },
  ];

  const colorMap = {
    green: { tab: 'bg-green-500 text-white', badge: 'bg-green-100 text-green-800', border: 'border-green-500' },
    red:   { tab: 'bg-red-500 text-white',   badge: 'bg-red-100 text-red-800',     border: 'border-red-500' },
    yellow:{ tab: 'bg-yellow-500 text-white', badge: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-500' },
  };

  const currentVoters = data[activeTab]?.voters || [];
  const activeColor = tabs.find(t => t.key === activeTab)?.color;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">🗳️ Voter Analysis</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {tabs.map(tab => (
          <div key={tab.key} className={`rounded-lg p-4 text-center border-2 cursor-pointer ${colorMap[tab.color].badge} ${activeTab === tab.key ? colorMap[tab.color].border : 'border-transparent'}`}
            onClick={() => setActiveTab(tab.key)}>
            <div className="text-2xl font-bold">{tab.count}</div>
            <div className="text-sm font-medium mt-1">{tab.label}</div>
          </div>
        ))}
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-2 mb-4">
        {tabs.map(tab => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === tab.key ? colorMap[tab.color].tab : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Voter List */}
      <div className="overflow-x-auto">
        {currentVoters.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No voters in this category</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-600">Name</th>
                <th className="text-left p-3 font-semibold text-gray-600">Voter ID</th>
                <th className="text-left p-3 font-semibold text-gray-600">Polling Station</th>
                {activeTab === 'not_voted' && <th className="text-left p-3 font-semibold text-gray-600">Current Location</th>}
                {activeTab === 'anomaly' && <th className="text-left p-3 font-semibold text-gray-600">Issue</th>}
              </tr>
            </thead>
            <tbody>
              {currentVoters.map((v, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-3">{v.full_name}</td>
                  <td className="p-3 font-mono text-xs">{v.voter_id}</td>
                  <td className="p-3">{v.polling_station}</td>
                  {activeTab === 'not_voted' && <td className="p-3 text-red-500">{v.current_location || 'Unknown'}</td>}
                  {activeTab === 'anomaly' && <td className="p-3 text-yellow-600">{v.reason}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}