// services/api.js - FIXED JAVASCRIPT VERSION
import axios from 'axios';

// Backend URLs
const BACKEND_URL = 'https://ecomm-backend-4ec9.onrender.com';
const DUMMY_API_URL = 'https://dummyjson.com';

// Main API instance for products
export const productsApi = axios.create({
  baseURL: DUMMY_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Backend API instance for emails
export const backendApi = axios.create({
  baseURL: BACKEND_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Email service functions
export const emailService = {
  // Send registration email
  sendRegistrationEmail: async (email, username) => {
    try {
      const response = await backendApi.post('/api/send-registration', {
        to: email,
        username: username
      });
      console.log('✅ Registration email sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Registration email error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to send registration email');
    }
  },

  // Send login email
  sendLoginEmail: async (email, username) => {
    try {
      const response = await backendApi.post('/api/send-login', {
        to: email,
        username: username
      });
      console.log('✅ Login email sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Login email error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to send login email');
    }
  },

  // Send order confirmation
  sendOrderConfirmation: async (email, order, user) => {
    try {
      const response = await backendApi.post('/api/send-order-success', {
        to: email,
        user: user,
        order: order
      });
      console.log('✅ Order confirmation email sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Order confirmation email error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to send order confirmation');
    }
  },

  // Send order failure email
  sendOrderFailure: async (email, order, user, reason) => {
    try {
      const response = await backendApi.post('/api/send-order-failure', {
        to: email,
        user: user,
        order: order,
        reason: reason
      });
      console.log('✅ Order failure email sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Order failure email error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to send order failure email');
    }
  },

  // Get sent emails (for inbox)
  getSentEmails: async () => {
    try {
      console.log('📧 Fetching sent emails from backend...');
      // Since your backend doesn't have this endpoint, return mock data
      return [
        {
          id: 1,
          type: 'welcome',
          subject: 'Welcome to Our Store!',
          to: 'user@example.com',
          date: new Date().toISOString(),
          read: false
        }
      ];
    } catch (error) {
      console.log('Email inbox not available, returning mock data');
      return [];
    }
  },

  // Clear sent emails
  clearSentEmails: async () => {
    console.log('Clear emails function called');
    return true;
  }
};

// Connection test functions
export const testBackendConnection = async () => {
  try {
    const response = await backendApi.get('/');
    console.log('✅ Backend connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

export const checkBackendHealth = async () => {
  try {
    const response = await backendApi.get('/health');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Backend health check failed:', error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

// Add request interceptor for logging
backendApi.interceptors.request.use(
  (config) => {
    console.log(`🚀 Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
backendApi.interceptors.response.use(
  (response) => {
    console.log('✅ Request successful:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ Request failed:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);