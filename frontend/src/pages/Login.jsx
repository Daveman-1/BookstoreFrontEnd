import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, BookOpen, AlertCircle, PlayCircle } from "lucide-react";
import { authService } from "../services/authService";
import { demoAuthService } from "../services/demoAuthService";
import { useSettings } from "../context/SettingsContext";

const Login = () => {
  const navigate = useNavigate();
  const { getStoreName } = useSettings();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    console.log('🔐 Starting login process...');
    console.log('Username:', username);
    console.log('Demo mode:', isDemoMode);
    console.log('API Base URL:', import.meta.env.VITE_API_URL || 'https://bookstorebackend-0n75.onrender.com/api');
    
    try {
      let result;
      
      if (isDemoMode) {
        console.log('🎭 Using demo authentication');
        result = await demoAuthService.login(username, password);
      } else {
        console.log('🌐 Using real authentication');
        result = await authService.login(username, password);
      }
      
      console.log('🔐 Login result:', result);
      
      setIsLoading(false);
      if (result.success) {
        console.log('✅ Login successful, user data:', result.user);
        
        // Ensure user data has required properties before storing
        const userData = {
          ...result.user,
          // Ensure name property exists
          name: result.user.name || result.user.username || result.user.email || 'User'
        };
        
        console.log('💾 Storing user data:', userData);
        sessionStorage.setItem('authUser', JSON.stringify(userData));
        
        // Verify storage
        const storedData = sessionStorage.getItem('authUser');
        console.log('✅ Verified stored data:', storedData);
        
        navigate('/dashboard', { replace: true });
      } else {
        console.error('❌ Login failed:', result.error);
        setError(result.error || 'Login failed. Please check your credentials.');
        
        // Auto-suggest demo mode if backend fails
        if (!isDemoMode && (result.error?.includes('404') || result.error?.includes('Server not found'))) {
          setIsDemoMode(true);
          setShowDemoCredentials(true);
        }
      }
    } catch (err) {
      console.error('💥 Login error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (err.response?.status === 404) {
        setError('Server not found. Switching to demo mode for testing.');
        setIsDemoMode(true);
        setShowDemoCredentials(true);
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later or use demo mode.');
        setShowDemoCredentials(true);
      } else {
        setError('Login failed. Please check your internet connection and try again.');
      }
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (demoUser) => {
    setUsername(demoUser.username);
    setPassword(demoUser.password);
    setIsDemoMode(true);
    setShowDemoCredentials(false);
  };

  // Redirect if already authenticated
  React.useEffect(() => {
    if (sessionStorage.getItem('authToken')) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // Set page title
  React.useEffect(() => {
    const storeName = getStoreName();
    document.title = `Sign In - ${storeName} Management System`;
  }, [getStoreName]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-xs sm:max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{getStoreName()}</h1>
          <p className="text-gray-600">Management System</p>
        </div>
        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Sign In
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
                required
              />
            </div>
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {isDemoMode && <PlayCircle className="w-4 h-4" />}
                  {isDemoMode ? 'Demo Sign In' : 'Sign In'}
                </div>
              )}
            </button>

            {/* Demo Mode Toggle */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDemoMode}
                  onChange={(e) => setIsDemoMode(e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-gray-600">Demo Mode</span>
              </label>
              <button
                type="button"
                onClick={() => setShowDemoCredentials(!showDemoCredentials)}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {showDemoCredentials ? 'Hide' : 'Show'} Demo Accounts
              </button>
            </div>

            {/* Demo Credentials */}
            {showDemoCredentials && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-3">Demo Accounts:</h3>
                <div className="space-y-2">
                  {demoAuthService.getDemoCredentials().map((demo, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDemoLogin(demo)}
                      className="w-full text-left p-2 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-gray-800">{demo.username}</span>
                          <span className="text-gray-600 ml-2">({demo.role})</span>
                        </div>
                        <span className="text-xs text-gray-500">{demo.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>

        </div>
        {/* Footer */}
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-sm text-gray-500">
            © 2024 {getStoreName()} Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 