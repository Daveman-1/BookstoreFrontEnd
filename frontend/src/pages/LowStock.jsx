import React, { useState, useEffect } from "react";
import { AlertTriangle, Plus, Package, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from '../services/api';
import EditItemModal from '../components/EditItemModal';

const LowStock = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("stock");
  const [editModalItem, setEditModalItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/items');
        console.log('LowStock - Fetched items:', res.data.items);
        setItems(res.data.items || []);
      } catch (err) {
        console.error('LowStock - Error fetching items:', err);
        setError('Failed to load items.');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const lowStockItems = items
    .filter(item => {
      const stockQty = parseInt(item.stock_quantity) || 0;
      return stockQty <= 10;
    })
    .sort((a, b) => {
      const stockA = parseInt(a.stock_quantity) || 0;
      const stockB = parseInt(b.stock_quantity) || 0;
      
      switch (sortBy) {
        case "stock":
          return stockA - stockB;
        case "stock_desc":
          return stockB - stockA;
        case "name":
          return (a.name || '').localeCompare(b.name || '');
        case "name_desc":
          return (b.name || '').localeCompare(a.name || '');
        case "price":
          return parseFloat(a.price || 0) - parseFloat(b.price || 0);
        case "price_desc":
          return parseFloat(b.price || 0) - parseFloat(a.price || 0);
        case "category":
          return (a.category || '').localeCompare(b.category || '');
        default:
          return stockA - stockB;
      }
    });

  const handleEdit = (item) => {
    setEditModalItem(item);
    setShowEditModal(true);
  };

  const handleUpdateItem = (updatedItem) => {
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const getStockLevel = (stock) => {
    const numStock = parseInt(stock) || 0;
    if (numStock === 0) return { level: "Critical", color: "text-red-600 bg-red-50" };
    if (numStock <= 5) return { level: "Very Low", color: "text-orange-600 bg-orange-50" };
    return { level: "Low", color: "text-yellow-600 bg-yellow-50" };
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  const formatStockQuantity = (stock) => {
    const numStock = parseInt(stock);
    return isNaN(numStock) ? '0' : numStock.toString();
  };

  if (loading) {
    return (
      <div className="p-6 w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading items...</p>
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

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6 flex-col sm:flex-row gap-4 sm:gap-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Low Stock Alerts</h1>
          <p className="text-gray-600 mt-1">
            {lowStockItems.length} items need attention
          </p>
        </div>
        <button
          onClick={() => navigate("/add-item")}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Item
        </button>
      </div>

      {/* Sort Options */}
      {lowStockItems.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field"
              >
                <option value="stock">Stock (Low to High)</option>
                <option value="stock_desc">Stock (High to Low)</option>
                <option value="name">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="price">Price (Low to High)</option>
                <option value="price_desc">Price (High to Low)</option>
                <option value="category">Category</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              {lowStockItems.length} items found
            </div>
          </div>
        </div>
      )}

      {lowStockItems.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-green-600">
            <TrendingUp className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">All items well stocked!</h3>
            <p className="text-gray-600">No low stock alerts at the moment.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Critical (0 stock)</p>
                  <p className="text-2xl font-bold text-red-600">
                    {lowStockItems.filter(item => (parseInt(item.stock_quantity) || 0) === 0).length}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Very Low (1-5 stock)</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {lowStockItems.filter(item => {
                      const stockQty = parseInt(item.stock_quantity) || 0;
                      return stockQty > 0 && stockQty <= 5;
                    }).length}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Low (6-10 stock)</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {lowStockItems.filter(item => {
                      const stockQty = parseInt(item.stock_quantity) || 0;
                      return stockQty > 5 && stockQty <= 10;
                    }).length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Low Stock Items List */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Items Requiring Attention</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Item</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Current Stock</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item) => {
                    const stockLevel = getStockLevel(item.stock_quantity);
                    return (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Package className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600 line-clamp-1">
                                {item.description || "No description"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium">{formatStockQuantity(item.stock_quantity)}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockLevel.color}`}>
                            {stockLevel.level}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium text-blue-600">
                            GHS {formatPrice(item.price)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleEdit(item)}
                            className="btn-primary text-sm px-3 py-1"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate("/add-item")}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center"
              >
                <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-medium">Add New Item</p>
                <p className="text-sm text-gray-600">Create new inventory</p>
              </button>
              
              <button
                onClick={() => navigate("/view-items")}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center"
              >
                <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-medium">View All Items</p>
                <p className="text-sm text-gray-600">Manage inventory</p>
              </button>
              
              <button
                onClick={() => navigate("/sales-history")}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center"
              >
                <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-medium">Sales Report</p>
                <p className="text-sm text-gray-600">View sales data</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      <EditItemModal
        item={editModalItem}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditModalItem(null);
        }}
        onUpdate={handleUpdateItem}
      />
    </div>
  );
};

export default LowStock; 