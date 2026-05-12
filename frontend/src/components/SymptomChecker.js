import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCheck, FiAlertCircle, FiLoader } from 'react-icons/fi';
import DoctorCard from './DoctorCard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SymptomChecker = ({ userEmail, setUserEmail, userName, setUserName }) => {
  const [symptoms, setSymptoms] = useState([]);
  const [availableSymptoms, setAvailableSymptoms] = useState([]);
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState('M');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    fetchSymptoms();
  }, []);

  const fetchSymptoms = async () => {
    try {
      const response = await axios.get(`${API_URL}/symptoms`);
      setAvailableSymptoms(response.data);
    } catch (err) {
      console.error('Error fetching symptoms:', err);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const getLocationAndFindDoctors = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          console.log('User location:', latitude, longitude);

          // FIRST: Show database doctors with distance
          if (result && result.doctors) {
            const doctorCoords = {
              'New York': { lat: 40.7128, lon: -74.0060 },
              'Los Angeles': { lat: 34.0522, lon: -118.2437 },
              'Chicago': { lat: 41.8781, lon: -87.6298 },
              'Houston': { lat: 29.7604, lon: -95.3698 },
              'Phoenix': { lat: 33.4484, lon: -112.0742 },
              'Philadelphia': { lat: 39.9526, lon: -75.1652 },
              'Bangalore': { lat: 12.9716, lon: 77.5946 }
            };

            const nearbyDoctors = result.doctors.map(doctor => {
              const coords = doctorCoords[doctor.location];
              if (coords) {
                const distance = calculateDistance(latitude, longitude, coords.lat, coords.lon);
                return { ...doctor, distance: parseFloat(distance) };
              }
              return doctor;
            }).sort((a, b) => (a.distance || 999) - (b.distance || 999));

            setResult({
              ...result,
              realDoctors: nearbyDoctors.slice(0, 5)
            });
            alert(`✅ Found ${nearbyDoctors.length} doctors nearby!`);
          }

          // SECOND: Try Google Places API
          if (window.google?.maps?.places) {
            try {
              const service = new window.google.maps.places.PlacesService(
                document.createElement('div')
              );

              const request = {
                location: new window.google.maps.LatLng(latitude, longitude),
                radius: 5000,
                keyword: 'doctor'
              };

              service.nearbySearch(request, (results, status) => {
                console.log('Google Places status:', status);
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.length > 0) {
                  console.log('Found Google doctors:', results.length);
                  const googleDoctors = results.slice(0, 5).map((place, idx) => ({
                    id: `google-${idx}`,
                    name: place.name,
                    specialization: 'Medical Professional',
                    location: place.vicinity,
                    phone: place.formatted_phone_number || '+1-800-DOCTOR',
                    email: 'info@clinic.com',
                    rating: place.rating || 4.5
                  }));

                  setResult(prev => ({
                    ...prev,
                    realDoctors: googleDoctors
                  }));
                  alert(`🌟 Found ${googleDoctors.length} real doctors from Google Maps!`);
                }
              });
            } catch (err) {
              console.log('Google Places not available:', err.message);
            }
          }

          setLocationLoading(false);
        },
        (err) => {
          console.error('Geolocation error:', err);
          alert('❌ Please enable location permission and try again');
          setLocationLoading(false);
        }
      );
    } else {
      alert('❌ Geolocation not supported');
      setLocationLoading(false);
    }
  };

  const handleSymptomSelect = (symptom) => {
    if (!symptoms.find(s => s.id === symptom.id)) {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const handleSymptomRemove = (symptomId) => {
    setSymptoms(symptoms.filter(s => s.id !== symptomId));
  };

  const handlePredict = async () => {
    if (symptoms.length < 3) {
      setError('Please select at least 3 symptoms');
      return;
    }
    if (!userName.trim() || !userEmail.trim()) {
      setError('Please enter your name and email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create/get user first
      const userResponse = await axios.post(`${API_URL}/users`, {
        name: userName,
        email: userEmail
      });

      const response = await axios.post(`${API_URL}/predict`, {
        symptoms: symptoms.map(s => s.name),
        age: parseInt(age),
        gender
      });

      setResult(response.data);

      // Save to history
      await axios.post(`${API_URL}/history`, {
        email: userEmail,
        age: parseInt(age),
        gender,
        symptoms: symptoms.map(s => s.name),
        disease: response.data.disease,
        confidence: response.data.confidence,
        severity: response.data.severity,
        doctor_id: response.data.doctors?.[0]?.id || null
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Error making prediction');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">HealthMatch</h1>
        <p className="text-gray-600 text-lg">Get AI-powered health insights and find the right doctor</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Side - Input Form */}
        <div className="card-hover bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Information</h2>

          {/* User Details */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="input-focus w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Enter your email"
                className="input-focus w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="input-focus w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
                  min="1"
                  max="150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="input-focus w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Symptoms Selection */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Select Symptoms</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">Choose from available symptoms:</label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                {availableSymptoms.map((symptom) => (
                  <button
                    key={symptom.id}
                    onClick={() => handleSymptomSelect(symptom)}
                    disabled={symptoms.find(s => s.id === symptom.id)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition ${
                      symptoms.find(s => s.id === symptom.id)
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-500'
                    }`}
                  >
                    {symptom.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Symptoms */}
            {symptoms.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Selected ({symptoms.length}):</label>
                <div className="space-y-2">
                  {symptoms.map((symptom) => (
                    <div
                      key={symptom.id}
                      className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200"
                    >
                      <span className="text-gray-800 font-medium">{symptom.name}</span>
                      <button
                        onClick={() => handleSymptomRemove(symptom.id)}
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-300 rounded-lg flex gap-2 text-red-700">
              <FiAlertCircle className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handlePredict}
            disabled={loading}
            className="btn-gradient w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <FiCheck />
                Get Prediction
              </>
            )}
          </button>
        </div>

        {/* Right Side - Results */}
        <div>
          {result ? (
            <div className="space-y-4 fade-in">
              {/* Disease Card */}
              <div className="card-hover bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Prediction Result</h2>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200">
                  <p className="text-gray-600 text-sm mb-2">Predicted Condition</p>
                  <h3 className="text-3xl font-bold gradient-text mb-4">{result.disease}</h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-gray-600 text-xs font-medium">Confidence Score</p>
                      <p className="text-2xl font-bold text-blue-600">{result.confidence}%</p>
                    </div>
                    <div className={`p-4 rounded-lg ${getSeverityColor(result.severity)}`}>
                      <p className="text-xs font-medium opacity-75">Severity</p>
                      <p className="text-2xl font-bold">{result.severity}</p>
                    </div>
                  </div>

                  <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>⚠️ Disclaimer:</strong> This is an AI prediction for informational purposes only.
                      Please consult a healthcare professional for accurate diagnosis and treatment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommended Doctors */}
              {result.doctors && result.doctors.length > 0 && (
                <div className="card-hover bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Recommended Doctors</h2>
                    <button
                      onClick={getLocationAndFindDoctors}
                      disabled={locationLoading}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg text-sm hover:shadow-lg transition disabled:opacity-50"
                    >
                      {locationLoading ? '📍 Getting location...' : '📍 Find Nearby'}
                    </button>
                  </div>

                  {result.realDoctors && result.realDoctors.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-green-600 mb-3">🌟 Nearby Doctors (Real-time)</h3>
                      <div className="space-y-4">
                        {result.realDoctors.map((doctor) => (
                          <DoctorCard key={doctor.id} doctor={doctor} distance={doctor.distance} userLocation={userLocation} />
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-bold text-blue-600 mb-3">📋 Recommended Specialists</h3>
                    <div className="space-y-4">
                      {result.doctors.map((doctor) => {
                        let distance = null;
                        if (userLocation && doctor.location) {
                          const doctorCoords = {
                            'New York': { lat: 40.7128, lon: -74.0060 },
                            'Los Angeles': { lat: 34.0522, lon: -118.2437 },
                            'Chicago': { lat: 41.8781, lon: -87.6298 },
                            'Houston': { lat: 29.7604, lon: -95.3698 },
                            'Phoenix': { lat: 33.4484, lon: -112.0742 },
                            'Philadelphia': { lat: 39.9526, lon: -75.1652 }
                          };
                          const coords = doctorCoords[doctor.location];
                          if (coords) {
                            distance = calculateDistance(userLocation.latitude, userLocation.longitude, coords.lat, coords.lon);
                          }
                        }
                        return <DoctorCard key={doctor.id} doctor={doctor} distance={distance} userLocation={userLocation} />;
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Clear Button */}
              <button
                onClick={() => {
                  setResult(null);
                  setSymptoms([]);
                  setError('');
                }}
                className="w-full px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition"
              >
                Start Over
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-8 h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl">🏥</span>
                </div>
                <p className="text-gray-600 text-lg">Select symptoms and click "Get Prediction"</p>
                <p className="text-gray-500 text-sm mt-2">Your results will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;
