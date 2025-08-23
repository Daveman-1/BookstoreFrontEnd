/**
 * Utility functions for authentication and user data handling
 */

/**
 * Safely gets the authenticated user from sessionStorage
 * @returns {Object|null} User object or null if not authenticated or data is corrupted
 */
export const getAuthUser = () => {
  try {
    const userData = sessionStorage.getItem('authUser');
    if (!userData) {
      console.warn('No user data found in sessionStorage');
      return null;
    }
    
    const parsedUser = JSON.parse(userData);
    
    // Validate that the user object has required properties
    if (parsedUser && typeof parsedUser === 'object' && parsedUser.role) {
      // Ensure name property exists
      if (!parsedUser.name) {
        parsedUser.name = parsedUser.username || parsedUser.email || 'User';
      }
      return parsedUser;
    }
    
    console.warn('Invalid user data structure:', parsedUser);
    // Invalid user data, clear storage
    clearAuthData();
    return null;
  } catch (error) {
    console.error('Error parsing user data from sessionStorage:', error);
    // Clear corrupted data
    clearAuthData();
    return null;
  }
};

/**
 * Checks if user is authenticated
 * @returns {boolean} True if user has valid authentication
 */
export const isAuthenticated = () => {
  const token = sessionStorage.getItem('authToken');
  const user = getAuthUser();
  return !!(token && user);
};

/**
 * Checks if user has a specific permission
 * @param {string} permission - Permission to check
 * @returns {boolean} True if user has permission
 */
export const hasPermission = (permission) => {
  const user = getAuthUser();
  if (!user) return false;
  
  // Admins have all permissions
  if (user.role === 'admin') return true;
  
  // Check user-specific permissions
  return user.permissions && user.permissions.includes(permission);
};

/**
 * Checks if user has one of the specified roles
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {boolean} True if user has one of the roles
 */
export const hasRole = (allowedRoles = []) => {
  const user = getAuthUser();
  return user && allowedRoles.includes(user.role);
};

/**
 * Clears authentication data from storage
 */
export const clearAuthData = () => {
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('authUser');
};

/**
 * Gets user display name with fallback
 * @returns {string} User's name or fallback text
 */
export const getUserDisplayName = () => {
  const user = getAuthUser();
  if (!user) return 'Guest';
  
  // Try multiple fallback options
  return user.name || 
         user.username || 
         user.email || 
         `${user.firstName || ''} ${user.lastName || ''}`.trim() || 
         'User';
};

/**
 * Gets user email with fallback
 * @returns {string} User's email or fallback text
 */
export const getUserEmail = () => {
  const user = getAuthUser();
  return user?.email || 'No email';
};

/**
 * Gets user role with fallback
 * @returns {string} User's role or fallback text
 */
export const getUserRole = () => {
  const user = getAuthUser();
  return user?.role || 'guest';
};