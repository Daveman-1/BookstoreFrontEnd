import React, { useState, useEffect } from "react";
import { X, Search, Plus, Minus, DollarSign, ShoppingCart } from "lucide-react";
import { itemService } from '../services/itemService';
import { salesService } from '../services/salesService';
import api from '../services/api';

const QuickSaleModal = ({ isOpen, onClose, onSaleComplete, title = "Quick Sale" }) => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const addToCart = (item) => {
    if (item.stock_quantity === 0) return;
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      if (existingItem.quantity < item.stock_quantity) {
        setCart(cart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        ));
      }
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      const item = items.find(i => i.id === itemId);
      if (newQuantity <= item.stock_quantity) {
        setCart(cart.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        ));
      }
    }
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const saleData = {
        customer_name: customerName || 'Walk-in Customer',
        customer_phone: customerPhone || '',
        payment_method: paymentMethod,
        items: cart.map(item => ({
          item_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        notes: 'Quick sale from dashboard'
      };

      const result = await salesService.createSale(saleData);
      if (!result.success) throw new Error(result.error);

      // Update local items with new stock quantities
      const updatedItems = items.map(item => {
        const cartItem = cart.find(c => c.id === item.id);
        if (cartItem) {
          return { ...item, stock_quantity: item.stock_quantity - cartItem.quantity };
        }
        return item;
      });
      setItems(updatedItems);

      // Reset form
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setPaymentMethod("cash");
      setSearchTerm("");
      setSelectedCategory("");

      // Notify parent component
      if (onSaleComplete) {
        onSaleComplete(result.data);
      }

      onClose();
    } catch (err) {
      setError('Failed to complete sale. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: "Out of Stock", color: "text-red-600 bg-red-50" };
    if (stock <= 10) return { text: "Low Stock", color: "text-orange-600 bg-orange-50" };
    return { text: "In Stock", color: "text-green-600 bg-green-50" };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(95vh-120px)]">
          {/* Left Side - Items Selection */}
          <div className="w-2/3 p-6 border-r border-gray-200 overflow-y-auto">
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
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredItems.map((item) => {
                  const stockStatus = getStockStatus(item.stock_quantity);
                  const cartItem = cart.find(c => c.id === item.id);
                  
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

                        {/* Add to Cart */}
                        {cartItem ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}
                              className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="flex-1 text-center text-sm font-medium">
                              {cartItem.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}
                              className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                              disabled={cartItem.quantity >= item.stock_quantity}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            disabled={item.stock_quantity === 0}
                            className="w-full btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-3 h-3 inline mr-1" />
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {filteredItems.length === 0 && !loading && (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No items found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>

          {/* Right Side - Cart and Checkout */}
          <div className="w-1/3 p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Shopping Cart</h3>
            
            {/* Customer Information */}
            <div className="mb-6 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Walk-in Customer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Cart Items */}
            <div className="mb-6 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Cart is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-600">GHS {item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                          disabled={item.quantity >= item.stock_quantity}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">GHS {(item.price * item.quantity).toFixed(2)}</p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            {/* Total and Checkout */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-green-600">GHS {getTotal().toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
                      Complete Sale (GHS {getTotal().toFixed(2)})
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSaleModal; 