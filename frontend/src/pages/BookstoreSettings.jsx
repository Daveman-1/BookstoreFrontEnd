import React, { useState, useEffect } from 'react';
import { Settings, Upload, Save, Building, Phone, Mail, Globe, FileText, Printer } from 'lucide-react';
import { convertImageToBase64 } from '../utils/enhancedReceiptGenerator';
import { useSettings } from '../context/SettingsContext';

const BookstoreSettings = () => {
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      let logoBase64 = localSettings.logo;
      
      // Convert new logo file to base64 if selected
      if (logoFile) {
        logoBase64 = await convertImageToBase64(logoFile);
      }

      const updatedSettings = {
        ...localSettings,
        logo: logoBase64
      };

      const result = await updateSettings(updatedSettings);
      if (result.success) {
        setMessage('Settings updated successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update settings.');
      }
    } catch (error) {
      setMessage('Failed to update settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLocalSettings(prev => ({ ...prev, logo: null }));
  };

  return (
    <div className="p-2 sm:p-6 w-full">
      <div className="flex items-center gap-3 mb-6 flex-col sm:flex-row">
        <Settings className="w-6 h-6 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">Store Info</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Building className="w-5 h-5" />
            Store Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Store Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Name
              </label>
              <input
                type="text"
                name="name"
                value={localSettings.name}
                onChange={handleInputChange}
                placeholder="Enter your store name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={localSettings.address}
                onChange={handleInputChange}
                rows="3"
                placeholder="Enter your store address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Contact
                </label>
                <input
                  type="tel"
                  name="contact"
                  value={localSettings.contact}
                  onChange={handleInputChange}
                  placeholder="Enter contact number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={localSettings.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Website and Tax Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={localSettings.website}
                  onChange={handleInputChange}
                  placeholder="Enter website URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Number
                </label>
                <input
                  type="text"
                  name="tax_number"
                  value={localSettings.tax_number}
                  onChange={handleInputChange}
                  placeholder="Enter tax number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Fax */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Printer className="w-4 h-4" />
                Fax
              </label>
              <input
                type="text"
                name="fax"
                value={localSettings.fax}
                onChange={handleInputChange}
                placeholder="Enter fax number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Receipt Footer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Receipt Footer Message
              </label>
              <textarea
                name="receipt_footer"
                value={localSettings.receipt_footer}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a custom message for receipts"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>

            {/* Message */}
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('Error') 
                  ? 'bg-red-50 text-red-600 border border-red-200' 
                  : 'bg-green-50 text-green-600 border border-green-200'
              }`}>
                {message}
              </div>
            )}
          </form>
        </div>

        {/* Logo Upload */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Store Logo
          </h2>

          <div className="space-y-4">
            {/* Logo Preview */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {logoPreview ? (
                <div className="space-y-4">
                  <img
                    src={logoPreview}
                    alt="Store Logo"
                    className="max-w-full h-32 object-contain mx-auto"
                  />
                  <button
                    onClick={removeLogo}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove Logo
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <p className="text-gray-600">No logo uploaded</p>
                  <p className="text-sm text-gray-500">Upload a logo to appear on receipts</p>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Logo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: Square image, max 2MB, JPG or PNG format
              </p>
            </div>
          </div>

          {/* Receipt Preview */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Receipt Preview</h3>
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="text-center space-y-2">
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="h-8 object-contain mx-auto"
                  />
                )}
                <h4 className="font-bold text-lg">{localSettings.name || 'Store Name'}</h4>
                {localSettings.address && <p className="text-sm text-gray-600">{localSettings.address}</p>}
                {localSettings.contact && <p className="text-sm text-gray-600">{localSettings.contact}</p>}
                {localSettings.email && <p className="text-sm text-gray-600">{localSettings.email}</p>}
                {localSettings.fax && <p className="text-sm text-gray-600">{localSettings.fax}</p>}
                <div className="border-t border-gray-300 pt-2 mt-2">
                  {localSettings.receipt_footer && <p className="text-xs text-gray-500">{localSettings.receipt_footer}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookstoreSettings; 