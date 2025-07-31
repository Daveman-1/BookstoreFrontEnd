import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Package, Tag } from "lucide-react";
import api from '../services/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: "", color: "bg-blue-100 text-blue-800" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const categoriesRes = await api.get('/categories');
        const itemsRes = await api.get('/items');
        setCategories(categoriesRes.data.categories || []);
        setItems(itemsRes.data.items || []);
      } catch (err) {
        setError('Failed to load categories or items.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const colorOptions = [
    { name: "Blue", value: "bg-blue-100 text-blue-800" },
    { name: "Green", value: "bg-green-100 text-green-800" },
    { name: "Purple", value: "bg-purple-100 text-purple-800" },
    { name: "Orange", value: "bg-orange-100 text-orange-800" },
    { name: "Red", value: "bg-red-100 text-red-800" },
    { name: "Yellow", value: "bg-yellow-100 text-yellow-800" },
    { name: "Gray", value: "bg-gray-100 text-gray-800" },
    { name: "Pink", value: "bg-pink-100 text-pink-800" },
  ];

  const getCategoryStats = (categoryName) => {
    const categoryItems = items.filter(item => item.category === categoryName);
    const totalItems = categoryItems.length;
    const totalValue = categoryItems.reduce((sum, item) => sum + (item.price * item.stock_quantity), 0);
    const lowStockItems = categoryItems.filter(item => item.stock_quantity <= 10).length;
    return { totalItems, totalValue, lowStockItems };
  };

  // Sort categories based on selected criteria
  const sortedCategories = categories.sort((a, b) => {
    const statsA = getCategoryStats(a.name);
    const statsB = getCategoryStats(b.name);
    
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "name_desc":
        return b.name.localeCompare(a.name);
      case "items":
        return statsA.totalItems - statsB.totalItems;
      case "items_desc":
        return statsB.totalItems - statsA.totalItems;
      case "value":
        return statsA.totalValue - statsB.totalValue;
      case "value_desc":
        return statsB.totalValue - statsA.totalValue;
      case "low_stock":
        return statsA.lowStockItems - statsB.lowStockItems;
      case "low_stock_desc":
        return statsB.lowStockItems - statsA.lowStockItems;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const handleAddCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/categories', newCategory);
      setCategories([...categories, res.data.category]);
      setShowAddModal(false);
      setNewCategory({ name: '', color: 'bg-blue-100 text-blue-800' });
    } catch (err) {
      setError('Failed to add category.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.put(`/categories/${editingCategory.id}`, editingCategory);
      setCategories(categories.map(cat => cat.id === editingCategory.id ? res.data.category : cat));
      setEditingCategory(null);
    } catch (err) {
      setError('Failed to update category.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        setLoading(true);
        setError(null);
        await api.delete(`/categories/${id}`);
        setCategories(categories.filter(cat => cat.id !== id));
      } catch (err) {
        setError('Failed to delete category.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading categories...</p>
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
  if (categories.length === 0) {
    return (
      <div className="p-6 w-full">
        <div className="text-center py-12">
          <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No categories found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6 flex-col sm:flex-row gap-4 sm:gap-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
          <p className="text-gray-600 mt-1">
            Manage product categories and organization
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Sort Options */}
      {categories.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field"
              >
                <option value="name">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="items">Items (Low to High)</option>
                <option value="items_desc">Items (High to Low)</option>
                <option value="value">Value (Low to High)</option>
                <option value="value_desc">Value (High to Low)</option>
                <option value="low_stock">Low Stock (Low to High)</option>
                <option value="low_stock_desc">Low Stock (High to Low)</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              {categories.length} categories found
            </div>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCategories.map((category) => {
          const stats = getCategoryStats(category.name);
          return (
            <div key={category.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <Tag className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Items</span>
                  <span className="font-semibold">{stats.totalItems}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Value</span>
                  <span className="font-semibold text-green-600">GHS {stats.totalValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Low Stock Items</span>
                  <span className={`font-semibold ${stats.lowStockItems > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {stats.lowStockItems}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${category.color}`}>
                  {category.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-md">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter category name"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Theme
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setNewCategory(prev => ({ ...prev, color: color.value }))}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          newCategory.color === color.value
                            ? 'border-blue-500'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${color.value}`}
                      >
                        <Tag className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddCategory}
                  className="btn-primary flex-1"
                >
                  Add Category
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-md">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Edit Category</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Theme
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setEditingCategory(prev => ({ ...prev, color: color.value }))}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          editingCategory.color === color.value
                            ? 'border-blue-500'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${color.value}`}
                      >
                        <Tag className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleEditCategory}
                  className="btn-primary flex-1"
                >
                  Update Category
                </button>
                <button
                  onClick={() => setEditingCategory(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories; 