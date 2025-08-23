import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, DollarSign, Package, AlertTriangle, ShoppingCart, Loader2, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { analyticsHelpers } from "../services/analyticsService";
import { itemService } from '../services/itemService';
import { salesService } from '../services/salesService';
import { sampleItems, sampleSales } from '../data/sampleData';
import ItemSelectionModal from '../components/ItemSelectionModal';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showItemSelectionModal, setShowItemSelectionModal] = useState(false);
  const navigate = useNavigate();

  // Get user info to determine role
  const getAuthUser = () => {
    try {
      const userData = sessionStorage.getItem('authUser');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };

  const user = getAuthUser();
  const isAdmin = user?.role === 'admin';

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const itemsResult = await itemService.getItems();
      const salesResult = await salesService.getSales();
      
      // Use real data if available, otherwise fall back to sample data
      if (itemsResult.success && itemsResult.data.items) {
        setItems(itemsResult.data.items);
      } else {
        if (import.meta.env.DEV) console.log('Using sample items data');
        setItems(sampleItems);
      }
      
      if (salesResult.success && salesResult.data.sales) {
        setSales(salesResult.data.sales);
      } else {
        if (import.meta.env.DEV) console.log('Using sample sales data');
        setSales(sampleSales);
      }
      
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      // Fallback to sample data on error
      if (import.meta.env.DEV) console.log('Using sample data due to API error');
      setItems(sampleItems);
      setSales(sampleSales);
      setError('Using sample data - API connection failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate statistics with better error handling
  const totalItems = items.length;
  const lowStockItems = items.filter(item => (item.stock_quantity || 0) <= 10);
  
  // Fix totalSales calculation
  const totalSales = sales.reduce((total, sale) => {
    // Handle both 'total' and 'total_amount' field names
    const amount = parseFloat(sale.total_amount || sale.total || 0);
    if (import.meta.env.DEV) console.log('Sale:', sale, 'Amount:', amount);
    return total + amount;
  }, 0);
  
  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.created_at || sale.date);
    return saleDate.toDateString() === new Date().toDateString();
  });
  
  const todayTotal = todaySales.reduce((sum, sale) => {
    // Handle both 'total' and 'total_amount' field names
    const amount = parseFloat(sale.total_amount || sale.total || 0);
    return sum + amount;
  }, 0);

  // Process data for charts using helpers
  const weeklyData = analyticsHelpers.processWeeklyData(sales);
  const pieData = analyticsHelpers.processCategoryData(items);
  const COLORS = analyticsHelpers.getChartColors();
  
  // Debug logging for weekly data (development only)
  if (import.meta.env.DEV) {
    console.log('Weekly data:', weeklyData);
    console.log('Sales data:', sales);
  }

  const handleSale = () => {
    setShowItemSelectionModal(true);
  };

  const handleSaleComplete = (saleData) => {
    // Refresh sales data after a successful sale
    fetchData();
  };

  if (loading) {
    return (
      <div className="p-6 w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 w-full">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="p-6 w-full">
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No items found in inventory.</p>
        </div>
      </div>
    );
  }
  if (sales.length === 0) {
    return (
      <div className="p-6 w-full">
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No sales data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6 flex-col sm:flex-row gap-4 sm:gap-0">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        {isAdmin && (
          <button
            onClick={handleSale}
            className="btn-primary flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Sale
          </button>
        )}
      </div>
      {/* Stats Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6 mb-8`}>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Sales</p>
              <p className="text-2xl font-bold text-green-600">GHS {Number(todayTotal).toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        {isAdmin && (
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-blue-600">GHS {Number(totalSales).toFixed(2)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        )}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-purple-600">{totalItems}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-red-600">{lowStockItems.length}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Sales Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Weekly Sales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`GHS ${value}`, 'Sales']} />
              <Bar dataKey="sales" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Category Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Products by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Sales</h3>
            <button
              onClick={() => navigate('/sales-history')}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {todaySales.slice(0, 5).map((sale) => (
              <div key={sale.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Sale #{sale.id}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(sale.created_at || sale.date), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <span className="text-green-600 font-semibold">GHS {Number(sale.total_amount || sale.total || 0).toFixed(2)}</span>
              </div>
            ))}
            {todaySales.length === 0 && (
              <p className="text-gray-500 text-center py-4">No sales today</p>
            )}
            {todaySales.length > 5 && (
              <div className="text-center pt-2">
                <p className="text-sm text-gray-500">
                  Showing 5 of {todaySales.length} sales
                </p>
              </div>
            )}
          </div>
        </div>
        {/* Low Stock Alerts */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Low Stock Alerts</h3>
            <button
              onClick={() => navigate('/low-stock')}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {lowStockItems.slice(0, 5).map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.category}</p>
                </div>
                <span className="text-red-600 font-semibold">{item.stock_quantity} left</span>
              </div>
            ))}
            {lowStockItems.length === 0 && (
              <p className="text-gray-500 text-center py-4">All items well stocked</p>
            )}
            {lowStockItems.length > 5 && (
              <div className="text-center pt-2">
                <p className="text-sm text-gray-500">
                  Showing 5 of {lowStockItems.length} low stock items
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Item Selection Modal */}
      <ItemSelectionModal
        isOpen={showItemSelectionModal}
        onClose={() => setShowItemSelectionModal(false)}
      />
    </div>
  );
};

export default Dashboard;
