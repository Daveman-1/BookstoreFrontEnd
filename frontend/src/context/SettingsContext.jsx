import React, { createContext, useContext, useState, useEffect } from 'react';
import { storeDetailsService } from '../services/storeDetailsService';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    name: 'Bookstore', // Default store name
    contact: '',
    website: '',
    address: '',
    fax: '',
    email: '',
    tax_number: '',
    receipt_footer: '',
    logo: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load settings from API
  const loadSettings = async () => {
    try {
      setLoading(true);
      const result = await storeDetailsService.getStoreDetails();
      if (result.success) {
        setSettings(result.data);
      } else {
        setError('Failed to load store settings');
        // Keep default settings on error
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load store settings');
      // Keep default settings on error
    } finally {
      setLoading(false);
    }
  };

  // Update settings
  const updateSettings = async (newSettings) => {
    try {
      const result = await storeDetailsService.updateStoreDetails(newSettings);
      if (result.success) {
        setSettings(result.data);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
      return { success: false, error: err.message };
    }
  };

  // Get store name with fallback
  const getStoreName = () => {
    return settings.name || 'Bookstore';
  };

  // Update document title when store name changes
  useEffect(() => {
    const storeName = getStoreName();
    document.title = `${storeName} - Management System`;
  }, [settings.name]);

  useEffect(() => {
    loadSettings();
  }, []);

  const value = {
    settings,
    loading,
    error,
    loadSettings,
    updateSettings,
    getStoreName
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}; 