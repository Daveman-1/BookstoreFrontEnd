import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, BookOpen, AlertCircle } from "lucide-react";
import { authService } from "../services/authService";
import { useSettings } from "../context/SettingsContext";

const Login = () => {
  const navigate = useNavigate();
  const { getStoreName } = useSettings();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.login(username, password);
      setIsLoading(false);
      if (result.success) {
        // Ensure user data has required properties before storing
        const userData = {
          ...result.user,
          // Ensure name property exists
          name: result.user.name || result.user.username || result.user.email || 'User'
        };
        
        sessionStorage.setItem('authUser', JSON.stringify(userData));
        console.log('User data stored:', userData);
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
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
                "Sign In"
              )}
            </button>
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