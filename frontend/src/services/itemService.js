import api from './api';

export const itemService = {
  // Get all items with optional filtering and pagination
  getItems: async (params = {}) => {
    try {
      const response = await api.get('/items', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch items'
      };
    }
  },

  // Get single item by ID
  getItem: async (id) => {
    try {
      const response = await api.get(`/items/${id}`);
      return { success: true, data: response.data.item };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch item'
      };
    }
  },

  // Create new item
  createItem: async (itemData) => {
    try {
      const response = await api.post('/items', itemData);
      return { success: true, data: response.data.item };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create item'
      };
    }
  },

  // Update item
  updateItem: async (id, itemData) => {
    try {
      const response = await api.put(`/items/${id}`, itemData);
      return { success: true, data: response.data.item };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update item'
      };
    }
  },

  // Delete item
  deleteItem: async (id) => {
    try {
      await api.delete(`/items/${id}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete item'
      };
    }
  },

  // Update item stock
  updateStock: async (id, quantity, operation = 'add') => {
    try {
      const response = await api.patch(`/items/${id}/stock`, {
        quantity,
        operation
      });
      return { success: true, data: response.data.item };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update stock'
      };
    }
  },

  // Get low stock items
  getLowStockItems: async (threshold = 10) => {
    try {
      const response = await api.get('/items/low-stock', {
        params: { threshold }
      });
      return { success: true, data: response.data.items };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch low stock items'
      };
    }
  },

  // Search items
  searchItems: async (query, filters = {}) => {
    try {
      const response = await api.get('/items/search', {
        params: { q: query, ...filters }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Search failed'
      };
    }
  },

  // Bulk update items
  bulkUpdate: async (updates) => {
    try {
      const response = await api.post('/items/bulk-update', { updates });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Bulk update failed'
      };
    }
  }
}; 