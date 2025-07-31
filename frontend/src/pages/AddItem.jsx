import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Plus, Upload, ArrowLeft, X } from "lucide-react";
import { itemService } from '../services/itemService';
import api from '../services/api';

const AddItem = () => {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

  // Watch for image changes
  const watchedImage = watch("image");

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/categories');
        setCategories(res.data.categories || []);
      } catch (err) {
        setError('Failed to load categories.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

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
      setError(null); // Clear any previous errors
      
      // Create compressed preview
      convertImageToBase64(file).then(base64 => {
        setImagePreview(base64);
      }).catch(err => {
        console.error('Failed to create preview:', err);
        setError('Failed to process image preview');
      });
    } else {
      setImagePreview(null);
      setImageFile(null);
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
      let imageBase64 = null;
      if (imageFile) {
        try {
          imageBase64 = await convertImageToBase64(imageFile);
        } catch (err) {
          console.error('Failed to convert image:', err);
          setError('Failed to process image. Please try again.');
          return;
        }
      }

      const newItem = {
        name: data.name,
        category: data.category,
        description: data.description,
        price: parseFloat(data.price),
        stock_quantity: parseInt(data.stock),
        image_url: imageBase64,
      };
      
      const result = await itemService.createItem(newItem);
      if (!result.success) throw new Error(result.error);
      reset();
      setImagePreview(null);
      setImageFile(null);
      navigate("/view-items");
    } catch (err) {
      setError('Failed to add item.');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    reset({ ...watch(), image: undefined });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      setError(null); // Clear any previous errors
      
      // Create compressed preview
      convertImageToBase64(file).then(base64 => {
        setImagePreview(base64);
      }).catch(err => {
        console.error('Failed to create preview:', err);
        setError('Failed to process image preview');
      });
      
      // Update form
      const event = {
        target: {
          files: [file]
        }
      };
      // Manually trigger the file input change
      const fileInput = document.getElementById('image-upload');
      if (fileInput) {
        fileInput.files = files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
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
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Add New Item</h1>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                {...register("name", { 
                  required: "Item name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" }
                })}
                placeholder="Enter item name"
                className="input-field"
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
                <option value="">Select Category</option>
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
                placeholder="Enter item description..."
                className="input-field resize-none"
              />
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  placeholder="0.00"
                  className="input-field"
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
                  placeholder="0"
                  className="input-field"
                />
                {errors.stock && (
                  <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Image
              </label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <input
                  type="file"
                  accept="image/*"
                  {...register("image")}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">
                    Click to upload
                  </span>
                  <span className="text-gray-500"> or drag and drop</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
              </div>
              {imagePreview && (
                <div className="mt-4 flex items-center justify-center">
                  <img src={imagePreview} alt="Preview" className="max-w-sm max-h-40 object-contain" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="ml-2 p-2 hover:bg-red-100 rounded-full text-red-600"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="btn-primary flex items-center gap-2 flex-1"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
              <button
                type="button"
                onClick={() => reset()}
                className="btn-secondary flex-1"
              >
                Reset Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItem;
