import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCalendar, FiLoader, FiUser } from 'react-icons/fi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const History = ({ userEmail }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      if (!userEmail) {
        setError('Please provide your email to view history');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await axios.get(`${API_URL}/history?email=${userEmail}`);
        setHistory(response.data || []);
      } catch (err) {
        setError('No history found or error loading history');
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      loadHistory();
    }
  }, [userEmail]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Your History</h1>
        <p className="text-gray-600 text-lg">View your previous health check-ups and predictions</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <FiLoader className="animate-spin text-4xl text-blue-500" />
          <span className="ml-3 text-lg text-gray-600">Loading history...</span>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 text-center">
          <p className="text-red-800 font-semibold">{error}</p>
        </div>
      )}

      {!loading && history.length === 0 && !error && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <FiUser className="text-3xl text-blue-500" />
          </div>
          <p className="text-gray-600 text-lg">No history available yet</p>
          <p className="text-gray-500 text-sm mt-2">Start a symptom check to build your health history</p>
        </div>
      )}

      {!loading && history.length > 0 && (
        <div className="grid gap-4">
          {history.map((item, index) => (
            <div
              key={item.id || index}
              className="card-hover bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
            >
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Predicted Condition</p>
                  <h3 className="text-xl font-bold text-gray-800">{item.predicted_disease}</h3>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">Confidence Score</p>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                        style={{ width: `${item.confidence_score}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-gray-800">{item.confidence_score}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">Severity</p>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${getSeverityColor(item.severity_level)}`}>
                    {item.severity_level}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-600 text-xs font-medium uppercase">Symptoms</p>
                    <p className="text-gray-800 text-sm mt-1">{item.symptoms}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs font-medium uppercase">Recommended Doctor</p>
                    <p className="text-gray-800 text-sm mt-1">{item.doctor_name || 'N/A'}</p>
                    <p className="text-gray-600 text-xs">{item.location}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs font-medium uppercase flex items-center gap-1">
                      <FiCalendar size={12} /> Check Date
                    </p>
                    <p className="text-gray-800 text-sm mt-1">{formatDate(item.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
