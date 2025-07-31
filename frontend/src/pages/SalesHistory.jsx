import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Search, Filter, Calendar, FileText, Download, Eye, Printer, TrendingUp, DollarSign, Package } from "lucide-react";
import { format, parseISO } from "date-fns";
import { printReceipt, downloadReceipt } from "../utils/receiptGenerator";
import { salesService } from '../services/salesService';
import { itemService } from '../services/itemService';
import { sampleSales, sampleItems } from '../data/sampleData';

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [dateRange, setDateRange] = useState("today");
  const [sortBy, setSortBy] = useState("date");
  const [selectedSale, setSelectedSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("analytics"); // "analytics" or "records"
  const [chartType, setChartType] = useState("weekly"); // "weekly" or "hourly"

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const salesResult = await salesService.getSales();
        const itemsResult = await itemService.getItems();
        
        console.log('SalesHistory - Sales result:', salesResult);
        console.log('SalesHistory - Items result:', itemsResult);
        
        // Use real data if available, otherwise fall back to sample data
        if (salesResult.success && salesResult.data.sales) {
          setSales(salesResult.data.sales);
        } else {
          console.log('Using sample sales data for SalesHistory');
          setSales(sampleSales);
        }
        
        if (itemsResult.success && itemsResult.data.items) {
          setItems(itemsResult.data.items);
        } else {
          console.log('Using sample items data for SalesHistory');
          setItems(sampleItems);
        }
        
      } catch (err) {
        console.error('SalesHistory fetch error:', err);
        console.log('Using sample data due to API error in SalesHistory');
        setSales(sampleSales);
        setItems(sampleItems);
        setError('Using sample data - API connection failed.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Get sales for analytics date range
  const getSalesForDateRange = () => {
    const today = new Date();
    const startDate = new Date();
    const endDate = new Date();

    switch (dateRange) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "yesterday":
        startDate.setDate(today.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(today.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "week":
        startDate.setDate(today.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "month":
        startDate.setDate(today.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
    }

    return sales.filter(sale => {
      const saleDate = new Date(sale.created_at || sale.date);
      return saleDate >= startDate && saleDate <= endDate;
    });
  };

  // Filter and sort sales for records tab
  const filteredSales = sales
    .filter(sale => {
      const matchesSearch = (sale.items || []).some(item => 
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      ) || sale.id.toString().includes(searchTerm);
      
      // Handle both created_at and date field names
      const saleDate = new Date(sale.created_at || sale.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      let matchesDate = true;
      switch (dateFilter) {
        case "today":
          matchesDate = saleDate.toDateString() === today.toDateString();
          break;
        case "yesterday":
          matchesDate = saleDate.toDateString() === yesterday.toDateString();
          break;
        case "week":
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          matchesDate = saleDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          matchesDate = saleDate >= monthAgo;
          break;
        default:
          matchesDate = true;
      }
      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.created_at || b.date) - new Date(a.created_at || a.date);
        case "date_oldest":
          return new Date(a.created_at || a.date) - new Date(b.created_at || b.date);
        case "amount":
          return parseFloat(b.total_amount || b.total || 0) - parseFloat(a.total_amount || a.total || 0);
        case "amount_lowest":
          return parseFloat(a.total_amount || a.total || 0) - parseFloat(b.total_amount || b.total || 0);
        case "id":
          return a.id - b.id;
        case "id_desc":
          return b.id - a.id;
        default:
          return new Date(b.created_at || b.date) - new Date(a.created_at || a.date);
      }
    });

  // Analytics calculations
  const analyticsSales = getSalesForDateRange();
  const totalSales = analyticsSales.reduce((sum, sale) => {
    const amount = parseFloat(sale.total_amount || sale.total || 0);
    return sum + amount;
  }, 0);
  const totalItems = analyticsSales.reduce((sum, sale) => sum + (sale.items_sold || 0), 0);
  const averageOrderValue = analyticsSales.length > 0 ? totalSales / analyticsSales.length : 0;

  // Records calculations
  const totalRevenue = filteredSales.reduce((sum, sale) => {
    const amount = parseFloat(sale.total_amount || sale.total || 0);
    return sum + amount;
  }, 0);
  const totalOrders = filteredSales.length;

  // Prepare chart data for analytics
  const weeklyData = [
    { day: 'Sunday', sales: 0, orders: 0 },
    { day: 'Monday', sales: 0, orders: 0 },
    { day: 'Tuesday', sales: 0, orders: 0 },
    { day: 'Wednesday', sales: 0, orders: 0 },
    { day: 'Thursday', sales: 0, orders: 0 },
    { day: 'Friday', sales: 0, orders: 0 },
    { day: 'Saturday', sales: 0, orders: 0 }
  ];

  // Calculate weekly sales data
  analyticsSales.forEach(sale => {
    const saleDate = new Date(sale.created_at || sale.date);
    const dayOfWeek = saleDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const amount = parseFloat(sale.total_amount || sale.total || 0);
    
    weeklyData[dayOfWeek].sales += amount;
    weeklyData[dayOfWeek].orders += 1;
  });

  // Also prepare hourly data for comparison
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hourSales = analyticsSales.filter(sale => {
      const saleHour = new Date(sale.created_at || sale.date).getHours();
      return saleHour === hour;
    });
    return {
      hour: `${hour}:00`,
      sales: hourSales.reduce((sum, sale) => {
        const amount = parseFloat(sale.total_amount || sale.total || 0);
        return sum + amount;
      }, 0),
      orders: hourSales.length
    };
  });

  const topSellingItems = items.map(item => {
    const itemSales = analyticsSales.reduce((sum, sale) => {
      const saleItem = (sale.items || []).find(si => si.item_id === item.id || si.itemId === item.id);
      return sum + (saleItem ? saleItem.quantity : 0);
    }, 0);
    return { ...item, soldQuantity: itemSales };
  }).filter(item => item.soldQuantity > 0)
    .sort((a, b) => b.soldQuantity - a.soldQuantity)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="p-6 w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sales history...</p>
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

  const exportSalesHistory = () => {
    const csvContent = [
      ["Date", "Time", "Sale ID", "Items", "Total Amount"],
      ...filteredSales.map(sale => [
        format(new Date(sale.created_at || sale.date), 'yyyy-MM-dd'),
        format(new Date(sale.created_at || sale.date), 'HH:mm:ss'),
        sale.id,
        (sale.items || []).map(item => `${item.name} (${item.quantity})`).join('; '),
        Number(sale.total_amount || sale.total || 0).toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const exportAnalyticsData = () => {
    const csvContent = [
      ["Date", "Sale ID", "Items", "Total", "Time"],
      ...analyticsSales.map(sale => [
        format(new Date(sale.created_at || sale.date), 'yyyy-MM-dd'),
        sale.id,
        (sale.items || []).map(item => `${item.name} (${item.quantity})`).join(', '),
        Number(sale.total_amount || sale.total || 0).toFixed(2),
        format(new Date(sale.created_at || sale.date), 'HH:mm')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6 flex-col sm:flex-row gap-4 sm:gap-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Sales History</h1>
          <p className="text-gray-600 mt-1">
            Complete sales analytics and transaction records
          </p>
        </div>
        <button
          onClick={activeTab === "analytics" ? exportAnalyticsData : exportSalesHistory}
          className="btn-secondary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export {activeTab === "analytics" ? "Analytics" : "History"}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="card mb-6">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === "analytics"
                ? "bg-blue-100 text-blue-800"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </div>
          </button>
          <button
            onClick={() => setActiveTab("records")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === "records"
                ? "bg-blue-100 text-blue-800"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Records
            </div>
          </button>
        </div>
      </div>

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <>
          {/* Date Range Selector */}
          <div className="card mb-6">
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-gray-600" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="input-field max-w-xs"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-green-600">GHS {totalSales.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-600">{analyticsSales.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Items Sold</p>
                  <p className="text-2xl font-bold text-purple-600">{totalItems}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Order</p>
                  <p className="text-2xl font-bold text-orange-600">GHS {averageOrderValue.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Chart */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {chartType === "weekly" ? "Weekly Sales Distribution" : "Hourly Sales Distribution"}
                </h3>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="weekly">Weekly</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartType === "weekly" ? weeklyData : hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={chartType === "weekly" ? "day" : "hour"} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`GHS ${value}`, 'Sales']} />
                  <Bar dataKey="sales" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Selling Items */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Top Selling Items</h3>
              <div className="space-y-3">
                {topSellingItems.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{item.soldQuantity} sold</p>
                      <p className="text-sm text-gray-600">GHS {(item.price * item.soldQuantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                {topSellingItems.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No sales data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Sales Table */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Recent Sales</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Sale ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Items</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsSales.slice(0, 10).map((sale) => (
                    <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <p className="font-medium">{format(new Date(sale.created_at || sale.date), 'HH:mm')}</p>
                        <p className="text-sm text-gray-600">{format(new Date(sale.created_at || sale.date), 'MMM dd, yyyy')}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm">#{sale.id}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {(sale.items || []).map((item, index) => (
                            <div key={index} className="text-sm">
                              {item.name} × {item.quantity}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-green-600">GHS {Number(sale.total_amount || sale.total || 0).toFixed(2)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {analyticsSales.length === 0 && (
                <p className="text-gray-500 text-center py-8">No sales found for the selected period</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Records Tab */}
      {activeTab === "records" && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">GHS {Number(totalRevenue || 0).toFixed(2)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Order</p>
                  <p className="text-2xl font-bold text-purple-600">
                    GHS {totalOrders > 0 ? Number(totalRevenue / totalOrders).toFixed(2) : "0.00"}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="card mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by item name or sale ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field"
              >
                <option value="date">Newest First</option>
                <option value="date_oldest">Oldest First</option>
                <option value="amount">Highest Amount</option>
                <option value="amount_lowest">Lowest Amount</option>
                <option value="id">Sale ID (Low to High)</option>
                <option value="id_desc">Sale ID (High to Low)</option>
              </select>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="w-4 h-4" />
                <span>{filteredSales.length} transactions found</span>
              </div>
            </div>
          </div>

          {/* Sales Table */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date & Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Sale ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Items Count</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Total Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{format(new Date(sale.created_at || sale.date), 'MMM dd, yyyy')}</p>
                          <p className="text-sm text-gray-600">{format(new Date(sale.created_at || sale.date), 'HH:mm:ss')}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          #{sale.id}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium">{sale.items?.length || 0} items</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-green-600">GHS {Number(sale.total_amount || sale.total || 0).toFixed(2)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedSale(sale)}
                            className="btn-secondary flex items-center gap-1 text-sm px-3 py-1"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                          <button
                            onClick={() => printReceipt(sale)}
                            className="btn-secondary flex items-center gap-1 text-sm px-3 py-1"
                          >
                            <Printer className="w-3 h-3" />
                            Print
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredSales.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No sales found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Sale Details Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-2xl max-h-[95vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Sale Details</h3>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Sale ID</p>
                    <p className="font-medium">#{selectedSale.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-medium">
                      {format(new Date(selectedSale.created_at || selectedSale.date), 'MMM dd, yyyy HH:mm:ss')}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Items Purchased</p>
                  <div className="space-y-2">
                    {(selectedSale.items || []).map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">GHS {(Number(item.price) * Number(item.quantity)).toFixed(2)}</p>
                          <p className="text-sm text-gray-600">GHS {Number(item.price).toFixed(2)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold text-green-600">
                      GHS {Number(selectedSale.total_amount || selectedSale.total || 0).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => printReceipt(selectedSale)}
                      className="btn-primary flex items-center gap-2 flex-1"
                    >
                      <Printer className="w-4 h-4" />
                      Print Receipt
                    </button>
                    <button
                      onClick={() => downloadReceipt(selectedSale)}
                      className="btn-secondary flex items-center gap-2 flex-1"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory; 