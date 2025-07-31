import api from './api';

export const salesService = {
  // Get all sales with optional filtering and pagination
  getSales: async (params = {}) => {
    try {
      const response = await api.get('/sales', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch sales'
      };
    }
  },

  // Get single sale by ID
  getSale: async (id) => {
    try {
      const response = await api.get(`/sales/${id}`);
      return { success: true, data: response.data.sale };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch sale'
      };
    }
  },

  // Create new sale
  createSale: async (saleData) => {
    try {
      const response = await api.post('/sales', saleData);
      return { success: true, data: response.data.sale };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create sale'
      };
    }
  },

  // Get daily sales summary
  getDailySales: async (date = null) => {
    try {
      const params = date ? { date } : {};
      const response = await api.get('/sales/daily', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch daily sales'
      };
    }
  },

  // Get sales by date range
  getSalesByDateRange: async (startDate, endDate) => {
    try {
      const response = await api.get('/sales/range', {
        params: { startDate, endDate }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch sales by date range'
      };
    }
  },

  // Get sales statistics
  getSalesStats: async (period = 'month') => {
    try {
      const response = await api.get('/sales/stats', {
        params: { period }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch sales statistics'
      };
    }
  },

  // Get top selling items
  getTopSellingItems: async (limit = 10, period = 'month') => {
    try {
      const response = await api.get('/sales/top-items', {
        params: { limit, period }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch top selling items'
      };
    }
  },

  // Generate sales report
  generateReport: async (reportType, params = {}) => {
    try {
      const response = await api.post('/sales/reports', {
        type: reportType,
        ...params
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to generate report'
      };
    }
  },

  // Get sales by staff member
  getSalesByStaff: async (staffId, params = {}) => {
    try {
      const response = await api.get(`/sales/staff/${staffId}`, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch staff sales'
      };
    }
  },

  // Void/refund sale
  voidSale: async (id, reason) => {
    try {
      const response = await api.post(`/sales/${id}/void`, { reason });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to void sale'
      };
    }
  }
}; 