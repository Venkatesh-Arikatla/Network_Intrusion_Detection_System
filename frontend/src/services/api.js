import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// API Functions
export const nidsApi = {
  // Health check
  getHealth: () => api.get('/health'),
  
  // Get statistics
  getStats: () => api.get('/stats'),
  
  // Test endpoint
  runTests: () => api.get('/test'),
  
  // Database test
  testDatabase: () => api.get('/db_test'),
  
  // Debug database
  debugDatabase: () => api.get('/debug_db'),
  
  // Debug model
  debugModel: () => api.get('/debug_model'),
  
  // Make prediction
  predictTraffic: (data) => api.post('/predict', data),
  
  // Get recent predictions (mock for now)
  getRecentPredictions: (limit = 10) => {
    // This would call a real endpoint if you implement it
    return Promise.resolve({
      data: {
        success: true,
        predictions: [
          {
            id: 20,
            timestamp: '2025-12-13T08:53:33',
            prediction: 1,
            prediction_label: 'CRITICAL Attack',
            confidence: 85.0,
            attack_probability: 1.05,
            normal_probability: 98.95,
            risk_level: 'CRITICAL',
            detection_method: 'Manual Rules',
            attack_reasons: ['DoS: count=511, bytes=0']
          },
          {
            id: 19,
            timestamp: '2025-12-13T08:53:18',
            prediction: 0,
            prediction_label: 'Normal',
            confidence: 98.68,
            attack_probability: 1.32,
            normal_probability: 98.68,
            risk_level: 'NORMAL',
            detection_method: 'ML Model'
          }
        ]
      }
    });
  }
};

export default api;