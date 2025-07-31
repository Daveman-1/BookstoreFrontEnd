import React, { useState, useEffect } from "react";
import { X, Search, Plus, Minus, ShoppingCart, DollarSign, Printer, Download } from "lucide-react";
import { printReceipt, downloadReceipt } from "../utils/receiptGenerator";
import { itemService } from '../services/itemService';
import { salesService } from '../services/salesService';
import { useSettings } from '../context/SettingsContext';

const SellModal = ({ item, onClose }) => {
  const { settings } = useSettings();
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showReceiptOptions, setShowReceiptOptions] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        if (item) {
          setItems([item]);
          setCart([{ ...item, quantity: 1 }]);
        } else {
          const result = await itemService.getItems();
          if (!result.success) throw new Error(result.error);
          setItems(result.data.items || []);
        }
      } catch (err) {
        setError('Failed to load items.');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [item]);

  const filteredItems = items.filter(item =>
    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
    item.stock_quantity > 0
  );

  const addToCart = (item) => {
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
    return cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      setLoading(true);
      const saleData = {
        items: cart.map(item => ({ item_id: item.id, quantity: item.quantity })),
        payment_method: paymentMethod,
        // Add other sale fields as needed
      };
      const result = await salesService.createSale(saleData);
      if (!result.success) throw new Error(result.error);
      setCompletedSale({ items: cart, total: getTotal(), paymentMethod });
      setShowReceiptOptions(true);
      setCart([]);
    } catch (err) {
      setError('Failed to process sale.');
    } finally {
      setLoading(false);
    }
  };

  const handleReceiptAction = async (action) => {
    if (action === 'print') {
      await printReceipt(completedSale);
    } else if (action === 'download') {
      await downloadReceipt(completedSale);
    }
    
    // Reset everything
    setCart([]);
    setPaymentMethod("cash");
    setShowReceiptOptions(false);
    setCompletedSale(null);
    setIsOpen(false);
  };

  const handleSkipReceipt = () => {
    setCart([]);
    setPaymentMethod("cash");
    setShowReceiptOptions(false);
    setCompletedSale(null);
    setIsOpen(false);
  };

  // Listen for global events to open modal
  useEffect(() => {
    if (item) {
      setIsOpen(true);
    } else {
      const handleQuickSale = () => setIsOpen(true);
      window.addEventListener('quick-sale', handleQuickSale);
      return () => window.removeEventListener('quick-sale', handleQuickSale);
    }
  }, [item]);

  if (!isOpen) return null;

  // Receipt Options Modal
  if (showReceiptOptions) {
    return (
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
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
              
              <button
                onClick={() => handleReceiptAction('download')}
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
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
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-2xl lg:max-w-6xl max-h-[95vh] overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Side - Item Selection */}
          <div className="w-full lg:w-2/3 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Quick Sale</h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (onClose) onClose();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Items Grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                    onClick={() => addToCart(item)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                          <ShoppingCart className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{item.name}</h3>
                        <p className="text-xs text-gray-600">{item.category}</p>
                        <p className="text-sm font-semibold text-blue-600">
                          GHS {Number(item.price).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">Stock: {item.stock_quantity}</p>
                      </div>
                      <button className="p-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No items found</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Cart */}
          <div className="w-full lg:w-1/3 p-4 sm:p-6 flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Shopping Cart</h3>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto mb-4">
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
                        <p className="text-xs text-gray-600">GHS {Number(item.price).toFixed(2)} each</p>
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
                        <p className="font-semibold text-sm">GHS {(Number(item.price) * Number(item.quantity)).toFixed(2)}</p>
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

            {/* Total */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span className="text-green-600">GHS {getTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DollarSign className="w-4 h-4" />
              Complete Sale (GHS {getTotal().toFixed(2)})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellModal;
