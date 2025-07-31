import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Upload, Save } from "lucide-react";
import { itemService } from '../services/itemService';
import api from '../services/api';

const EditItemModal = ({ item, isOpen, onClose, onUpdate }) => {
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Watch for image changes
  const watchedImage = watch("image");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.categories || []);
      } catch (err) {
        setError('Failed to load categories.');
      }
    };
    fetchCategories();
  }, []);

  // Reset form when item changes
  useEffect(() => {
    if (item && isOpen) {
      reset({
        name: item.name || '',
        category: item.category || '',
        description: item.description || '',
        price: item.price || '',
        stock: item.stock_quantity || '',
        minStock: item.min_stock_level || 10
      });
      setImagePreview(item.image_url || null);
      setImageFile(null);
      setError(null);
    }
  }, [item, isOpen, reset]);

  // Handle image file changes
  useEffect(() => {
    if (watchedImage && watchedImage[0]) {
      const file = watchedImage[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      setImageFile(file);
      setError(null);
      
      // Create compressed preview
      convertImageToBase64(file).then(base64 => {
        setImagePreview(base64);
      }).catch(err => {
        console.error('Failed to create preview:', err);
        setError('Failed to process image preview');
      });
    }
  }, [watchedImage]);

  // Convert image to base64 with compression
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 800px width/height)
        const maxSize = 800;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with quality 0.8 (80%)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert image to base64 if present
      let imageBase64 = item.image_url; // Keep existing image if no new one
      if (imageFile) {
        try {
          imageBase64 = await convertImageToBase64(imageFile);
        } catch (err) {
          console.error('Failed to convert image:', err);
          setError('Failed to process image. Please try again.');
          return;
        }
      }

      const updatedItem = {
        name: data.name,
        category: data.category,
        description: data.description,
        price: parseFloat(data.price),
        stock_quantity: parseInt(data.stock),
        min_stock_level: parseInt(data.minStock),
        image_url: imageBase64,
      };
      
      const result = await itemService.updateItem(item.id, updatedItem);
      if (!result.success) throw new Error(result.error);
      
      onUpdate(result.data);
      onClose();
    } catch (err) {
      setError('Failed to update item.');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    reset({ ...watch(), image: undefined });
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Edit Item</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                {...register("name", { required: "Item name is required" })}
                className="input-field"
                placeholder="Enter item name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                {...register("category", { required: "Category is required" })}
                className="input-field"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register("description")}
                rows="3"
                className="input-field"
                placeholder="Enter item description"
              />
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (GHS) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("price", { 
                    required: "Price is required",
                    min: { value: 0, message: "Price must be positive" }
                  })}
                  className="input-field"
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  {...register("stock", { 
                    required: "Stock quantity is required",
                    min: { value: 0, message: "Stock must be positive" }
                  })}
                  className="input-field"
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>
                )}
              </div>
            </div>

            {/* Minimum Stock Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Stock Level
              </label>
              <input
                type="number"
                min="0"
                {...register("minStock", { 
                  min: { value: 0, message: "Minimum stock must be positive" }
                })}
                className="input-field"
                placeholder="10"
              />
              {errors.minStock && (
                <p className="text-red-500 text-sm mt-1">{errors.minStock.message}</p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Image
              </label>
              <div className="space-y-4">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Upload Input */}
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      {...register("image")}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Upload className="w-4 h-4" />
                      <span>Upload Image</span>
                    </div>
                  </label>
                  <span className="text-sm text-gray-500">
                    Max 5MB, JPG or PNG
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2 flex-1"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Item
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditItemModal; 