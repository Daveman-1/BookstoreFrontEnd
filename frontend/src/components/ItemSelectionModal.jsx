import React, { useState, useEffect } from "react";
import { X, Search, ShoppingCart } from "lucide-react";
import { itemService } from '../services/itemService';
import api from '../services/api';
import SellModal from './SellModal';

const ItemSelectionModal = ({ isOpen, onClose }) => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showSellModal, setShowSellModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const itemsResult = await itemService.getItems();
      const categoriesRes = await api.get('/categories');
      
      if (itemsResult.success && itemsResult.data.items) {
        setItems(itemsResult.data.items);
      }
      if (categoriesRes.data && categoriesRes.data.categories) {
        setCategories(categoriesRes.data.categories);
      }
    } catch (err) {
      setError('Failed to load items or categories.');
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on search and category
  const filteredItems = items
    .filter(item => {
      const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      return matchesSearch && matchesCategory && (item.stock_quantity || 0) > 0;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleSellItem = (item) => {
    setSelectedItem(item);
    setShowSellModal(true);
  };

  const handleSellModalClose = () => {
    setShowSellModal(false);
    setSelectedItem(null);
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) return { text: "Out of Stock", color: "text-red-600 bg-red-50" };
    if (stock <= 10) return { text: "Low Stock", color: "text-orange-600 bg-orange-50" };
    return { text: "In Stock", color: "text-green-600 bg-green-50" };
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Select Item to Sell</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Search and Filter */}
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Items Grid */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading items...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center text-red-600 py-8">{error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                {filteredItems.map((item) => {
                  const stockStatus = getStockStatus(item.stock_quantity);
                  
                  return (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      {/* Item Image */}
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ShoppingCart className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {item.description || "No description"}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-blue-600">
                            GHS {Number(item.price).toFixed(2)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                            {stockStatus.text}
                          </span>
                        </div>

                        <div className="text-xs text-gray-600">
                          Stock: {item.stock_quantity}
                        </div>

                        {/* Sell Button */}
                        <button
                          onClick={() => handleSellItem(item)}
                          disabled={item.stock_quantity <= 0}
                          className={`w-full mt-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            item.stock_quantity > 0
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Sell
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {filteredItems.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No items found matching your search criteria.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sell Modal */}
      {selectedItem && (
        <SellModal
          isOpen={showSellModal}
          onClose={handleSellModalClose}
          item={selectedItem}
        />
      )}
    </>
  );
};

export default ItemSelectionModal; 