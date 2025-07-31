import React, { useState, useEffect } from "react";
import { Search, Edit, Trash2, Plus, Package, ShoppingCart, DollarSign, Minus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { printReceipt, downloadReceipt } from "../utils/receiptGenerator";
import { itemService } from '../services/itemService';
import api from '../services/api';
import SellModal from '../components/SellModal';
import ConfirmModal from '../components/ConfirmModal';
import EditItemModal from '../components/EditItemModal';

const ViewItems = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showCart, setShowCart] = useState(false);
  const [showReceiptOptions, setShowReceiptOptions] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sellModalItem, setSellModalItem] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editModalItem, setEditModalItem] = useState(null);

  const user = JSON.parse(sessionStorage.getItem('authUser'));
  const isAdmin = user?.role === 'admin';
  const canManageInventory = isAdmin || (user?.permissions && user.permissions.includes('manage_inventory'));
  const canSell = !isAdmin && !(user?.permissions && user.permissions.includes('manage_inventory'));

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const itemsResult = await itemService.getItems();
        const categoriesRes = await api.get('/categories');
        if (!itemsResult.success || !categoriesRes.data) throw new Error('Failed to fetch data');
        setItems(itemsResult.data.items || []);
        setCategories(categoriesRes.data.categories || []);
      } catch (err) {
        setError('Failed to load items or categories.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter and sort items
  const filteredItems = items
    .filter(item => {
      const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return a.price - b.price;
        case "stock":
          return a.stock_quantity - b.stock_quantity;
        case "category":
          return (a.category || '').localeCompare(b.category || '');
        default:
          return 0;
      }
    });

  const handleDelete = async (id) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    try {
      const result = await itemService.deleteItem(confirmDeleteId);
      if (!result.success) throw new Error(result.error);
      setItems(items.filter(item => item.id !== confirmDeleteId));
    } catch (err) {
      setError('Failed to delete item.');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleEdit = (item) => {
    setEditModalItem(item);
  };

  const handleUpdateItem = (updatedItem) => {
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: "Out of Stock", color: "text-red-600 bg-red-50" };
    if (stock <= 10) return { text: "Low Stock", color: "text-orange-600 bg-orange-50" };
    return { text: "In Stock", color: "text-green-600 bg-green-50" };
  };

  // Cart functions
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
    // Implement sale API call here if needed
    setCompletedSale({ items: cart, total: getTotal(), paymentMethod });
    setShowReceiptOptions(true);
    setCart([]);
  };

  const handleReceiptAction = (action) => {
    if (action === 'print') {
      printReceipt(completedSale);
    } else if (action === 'download') {
      downloadReceipt(completedSale);
    }
    
    // Reset everything
    setCart([]);
    setPaymentMethod("cash");
    setShowReceiptOptions(false);
    setCompletedSale(null);
    setShowCart(false);
  };

  const handleSkipReceipt = () => {
    setCart([]);
    setPaymentMethod("cash");
    setShowReceiptOptions(false);
    setCompletedSale(null);
    setShowCart(false);
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
  if (filteredItems.length === 0) {
    return (
      <div className="p-6 w-full">
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No items found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6 flex-col sm:flex-row gap-4 sm:gap-0">
        <h1 className="text-3xl font-bold text-gray-800">
          {isAdmin ? "View Items" : "Sales"}
        </h1>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => navigate("/add-item")}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Item
            </button>
          )}
          
          {!isAdmin && cart.length > 0 && (
            <button
              onClick={() => setShowCart(true)}
              className="btn-primary flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Cart ({cart.length})
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="stock">Sort by Stock</option>
            <option value="category">Sort by Category</option>
          </select>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            {/* <Filter className="w-4 h-4" /> */}
            <span>{filteredItems.length} items found</span>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No items found</h3>
            <p className="mb-4">Try adjusting your search or filter criteria</p>
            {isAdmin && (
              <button
                onClick={() => navigate("/add-item")}
                className="btn-primary"
              >
                Add Your First Item
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const stockStatus = getStockStatus(item.stock_quantity);
            const cartItem = cart.find(c => c.id === item.id);
            
            return (
              <div key={item.id} className="card hover:shadow-lg transition-shadow">
                {/* Item Image */}
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="w-12 h-12" />
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {item.description || "No description available"}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">
                      GHS {Number(item.price).toFixed(2)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Stock: {item.stock_quantity}</span>
                    <span className="capitalize">{item.category}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {canManageInventory ? (
                      <>
                        <button
                          onClick={() => handleEdit(item)}
                          className="flex-1 btn-secondary flex items-center justify-center gap-1 text-sm"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex-1 btn-danger flex items-center justify-center gap-1 text-sm"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </>
                    ) : canSell ? (
                      <button
                        onClick={() => setSellModalItem(item)}
                        disabled={item.stock_quantity === 0}
                        className="w-full btn-primary flex items-center justify-center gap-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Sell
                      </button>
                    ) : (
                      <>
                        {cartItem ? (
                          <div className="flex items-center gap-2 w-full">
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
                            className="w-full btn-primary flex items-center justify-center gap-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-3 h-3" />
                            Add to Cart
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-2xl max-h-[95vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Shopping Cart</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Cart is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
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

            {cart.length > 0 && (
              <div className="p-4 sm:p-6 border-t border-gray-200">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="input-field"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-green-600">GHS {getTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Complete Sale (GHS {getTotal().toFixed(2)})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Receipt Options Modal */}
      {showReceiptOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-md md:max-w-2xl p-4 sm:p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Sale Completed!</h2>
              <p className="text-gray-600 mb-6">Total: GHS {completedSale.total.toFixed(2)}</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleReceiptAction('print')}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Print Receipt
                </button>
                
                <button
                  onClick={() => handleReceiptAction('download')}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Download PDF
                </button>
                
                <button
                  onClick={handleSkipReceipt}
                  className="w-full text-gray-600 hover:text-gray-800 py-2 px-4 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
                >
                  Skip Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sell Modal for staff */}
      {sellModalItem && (
        <SellModal item={sellModalItem} onClose={() => setSellModalItem(null)} />
      )}

      {/* Edit Item Modal */}
      <EditItemModal
        item={editModalItem}
        isOpen={!!editModalItem}
        onClose={() => setEditModalItem(null)}
        onUpdate={handleUpdateItem}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ViewItems; 