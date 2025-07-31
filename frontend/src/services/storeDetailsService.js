import api from './api';

export const storeDetailsService = {
  // Get store details
  getStoreDetails: async () => {
    try {
      const response = await api.get('/store-details');
      return {
        success: true,
        data: response.data.storeDetails
      };
    } catch (error) {
      console.error('Error fetching store details:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch store details'
      };
    }
  },

  // Update store details
  updateStoreDetails: async (storeDetails) => {
    try {
      const response = await api.put('/store-details', storeDetails);
      return {
        success: true,
        data: response.data.storeDetails,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error updating store details:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update store details'
      };
    }
  }
}; 