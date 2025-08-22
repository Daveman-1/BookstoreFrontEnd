import api from './api';

export const analyticsService = {
  // Get comprehensive dashboard analytics
  getDashboardAnalytics: async (period = 'month') => {
    try {
      const response = await api.get('/analytics/dashboard', {
        params: { period }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch dashboard analytics'
      };
    }
  },

  // Get sales trends over time
  getSalesTrends: async (period = 'month', interval = 'day') => {
    try {
      const response = await api.get('/analytics/sales-trends', {
        params: { period, interval }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch sales trends'
      };
    }
  },

  // Get category performance
  getCategoryPerformance: async (period = 'month') => {
    try {
      const response = await api.get('/analytics/category-performance', {
        params: { period }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch category performance'
      };
    }
  },

  // Get top performing items
  getTopItems: async (limit = 10, period = 'month', metric = 'revenue') => {
    try {
      const response = await api.get('/analytics/top-items', {
        params: { limit, period, metric }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch top items'
      };
    }
  },

  // Get staff performance
  getStaffPerformance: async (period = 'month') => {
    try {
      const response = await api.get('/analytics/staff-performance', {
        params: { period }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch staff performance'
      };
    }
  },

  // Get inventory analytics
  getInventoryAnalytics: async () => {
    try {
      const response = await api.get('/analytics/inventory');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch inventory analytics'
      };
    }
  },

  // Get profit margins
  getProfitMargins: async (period = 'month') => {
    try {
      const response = await api.get('/analytics/profit-margins', {
        params: { period }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch profit margins'
      };
    }
  },

  // Get customer analytics (if customer data is available)
  getCustomerAnalytics: async (period = 'month') => {
    try {
      const response = await api.get('/analytics/customers', {
        params: { period }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch customer analytics'
      };
    }
  },

  // Generate custom report
  generateCustomReport: async (reportConfig) => {
    try {
      const response = await api.post('/analytics/custom-report', reportConfig);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to generate custom report'
      };
    }
  },

  // Get real-time analytics
  getRealTimeAnalytics: async () => {
    try {
      const response = await api.get('/analytics/real-time');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch real-time analytics'
      };
    }
  }
};

// Helper functions for data processing
export const analyticsHelpers = {
  // Process sales data for charts
  processSalesData: (salesData) => {
    if (!salesData || !Array.isArray(salesData)) return [];
    
    return salesData.map(sale => ({
      date: new Date(sale.created_at || sale.date).toLocaleDateString(),
      amount: parseFloat(sale.total_amount || sale.total || 0),
      items: (sale.items || []).length,
      timestamp: new Date(sale.created_at || sale.date).getTime()
    }));
  },

  // Process category data for pie charts
  processCategoryData: (items) => {
    if (!items || !Array.isArray(items)) return [];
    
    const categoryCount = items.reduce((acc, item) => {
      const category = item.category || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / items.length) * 100).toFixed(1)
    }));
  },

  // Process weekly data
  processWeeklyData: (salesData) => {
    if (!salesData || !Array.isArray(salesData)) return [];
    
    if (import.meta.env.DEV) console.log('Processing weekly data for:', salesData.length, 'sales');
    
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0); // Set to start of day
      
      const daySales = salesData.filter(sale => {
        try {
          const saleDate = new Date(sale.created_at || sale.date);
          saleDate.setHours(0, 0, 0, 0); // Set to start of day
          return saleDate.getTime() === date.getTime();
        } catch (error) {
          console.error('Error processing sale date:', sale, error);
          return false;
        }
      });
      
      const totalSales = daySales.reduce((sum, sale) => {
        try {
          const amount = parseFloat(sale.total_amount || sale.total || 0);
          return sum + (isNaN(amount) ? 0 : amount);
        } catch (error) {
          console.error('Error processing sale amount:', sale, error);
          return sum;
        }
      }, 0);
      
      return {
        date: weekDays[date.getDay()],
        sales: totalSales,
        count: daySales.length
      };
    });

    if (import.meta.env.DEV) console.log('Processed weekly data:', weeklyData);
    return weeklyData;
  },

  // Process monthly data
  processMonthlyData: (salesData) => {
    if (!salesData || !Array.isArray(salesData)) return [];
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthSales = salesData.filter(sale => 
        new Date(sale.created_at || sale.date).getMonth() === i
      );
      return {
        month: months[i],
        sales: monthSales.reduce((sum, sale) => {
          const amount = parseFloat(sale.total_amount || sale.total || 0);
          return sum + amount;
        }, 0),
        count: monthSales.length
      };
    });

    return monthlyData;
  },

  // Calculate growth rate
  calculateGrowthRate: (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  },

  // Format currency
  formatCurrency: (amount, currency = 'GHS') => {
    return `${currency} ${parseFloat(amount).toFixed(2)}`;
  },

  // Get color palette for charts
  getChartColors: () => [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280'  // Gray
  ]
}; 