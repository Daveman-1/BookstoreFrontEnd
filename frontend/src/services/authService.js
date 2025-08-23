import api from './api';

export const authService = {
  // Login user
  login: async (username, password) => {
    try {
      console.log('🔐 authService.login called with:', { username, password: '***' });
      console.log('🌍 API Base URL:', api.defaults.baseURL);
      
      const response = await api.post('/auth/login', { username, password });
      console.log('✅ Login API response:', response);
      console.log('📄 Response data:', response.data);
      
      const { token, user } = response.data.data;
      console.log('🔑 Extracted token:', token ? 'Present' : 'Missing');
      console.log('👤 Extracted user:', user);
      
      // Store token in sessionStorage immediately after successful login
      sessionStorage.setItem('authToken', token);
      if (import.meta.env.DEV) console.log('🔐 Token stored in sessionStorage');
      
      return { success: true, user, token };
    } catch (error) {
      console.error('❌ Login failed with error:', error);
      console.error('📊 Error response data:', error.response?.data);
      console.error('📊 Error status:', error.response?.status);
      console.error('📊 Error message:', error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed'
      };
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear session storage
      sessionStorage.removeItem('authToken');
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return { success: true, user: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get profile'
      };
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh');
      const { token } = response.data;
      sessionStorage.setItem('authToken', token);
      return { success: true, token };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Token refresh failed'
      };
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Password change failed'
      };
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!sessionStorage.getItem('authToken');
  },

  // Check session validity with backend (rate-limited)
  checkSession: async () => {
    try {
      const response = await api.get('/auth/session');
      return { success: true, user: response.data.data.user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Session check failed'
      };
    }
  }
}; 