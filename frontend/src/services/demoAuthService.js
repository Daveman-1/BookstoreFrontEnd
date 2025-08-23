/**
 * Demo Authentication Service
 * Used when backend is unavailable for testing purposes
 */

// Demo users for testing
const DEMO_USERS = [
  {
    id: 1,
    username: 'admin',
    password: 'admin',
    name: 'Admin User',
    email: 'admin@bookstore.com',
    role: 'admin',
    permissions: [
      'manage_inventory',
      'view_inventory', 
      'manage_sales',
      'view_sales_history',
      'manage_users',
      'approve_uploads',
      'upload_excel',
      'manage_categories'
    ]
  },
  {
    id: 2,
    username: 'staff',
    password: 'staff',
    name: 'Staff User',
    email: 'staff@bookstore.com',
    role: 'staff',
    permissions: [
      'view_inventory',
      'manage_sales',
      'view_sales_history',
      'upload_excel'
    ]
  },
  {
    id: 3,
    username: 'demo',
    password: 'demo',
    name: 'Demo User',
    email: 'demo@bookstore.com',
    role: 'staff',
    permissions: [
      'view_inventory',
      'manage_sales'
    ]
  }
];

export const demoAuthService = {
  // Login user (demo mode)
  login: async (username, password) => {
    console.log('🎭 Using DEMO auth service');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = DEMO_USERS.find(u => u.username === username && u.password === password);
    
    if (user) {
      // Create a clean user object without password
      const { password: _, ...userWithoutPassword } = user;
      const token = `demo-token-${Date.now()}-${user.id}`;
      
      console.log('✅ Demo login successful for user:', userWithoutPassword);
      return { 
        success: true, 
        user: userWithoutPassword, 
        token 
      };
    } else {
      console.log('❌ Demo login failed for username:', username);
      return {
        success: false,
        error: 'Invalid username or password'
      };
    }
  },

  // Get available demo credentials
  getDemoCredentials: () => {
    return DEMO_USERS.map(user => ({
      username: user.username,
      password: user.password,
      role: user.role,
      name: user.name
    }));
  }
};