/**
 * Authentication Debug Test Script
 * Run this in browser console to test authentication functions
 */

// Test authentication helpers
import { getAuthUser, isAuthenticated, getUserDisplayName, clearAuthData } from '../utils/authHelpers.js';

export const runAuthTests = () => {
  console.log('=== Authentication Debug Tests ===');
  
  // Test 1: Check current auth state
  console.log('1. Current authentication state:');
  console.log('- isAuthenticated():', isAuthenticated());
  console.log('- getAuthUser():', getAuthUser());
  console.log('- getUserDisplayName():', getUserDisplayName());
  
  // Test 2: Check session storage content
  console.log('\n2. Session storage content:');
  console.log('- authToken:', sessionStorage.getItem('authToken'));
  console.log('- authUser raw:', sessionStorage.getItem('authUser'));
  
  // Test 3: Test with corrupted data
  console.log('\n3. Testing with corrupted user data:');
  sessionStorage.setItem('authUser', 'invalid-json');
  console.log('- After setting invalid JSON:', getAuthUser());
  
  // Test 4: Test with incomplete user data
  console.log('\n4. Testing with incomplete user data:');
  sessionStorage.setItem('authUser', JSON.stringify({ id: 1 })); // Missing role
  console.log('- After setting incomplete data:', getAuthUser());
  
  // Test 5: Test with minimal valid user data
  console.log('\n5. Testing with minimal valid user data:');
  sessionStorage.setItem('authUser', JSON.stringify({ 
    id: 1, 
    role: 'staff' 
  })); // Missing name
  console.log('- After setting minimal valid data:', getAuthUser());
  console.log('- Display name:', getUserDisplayName());
  
  // Test 6: Test with complete user data
  console.log('\n6. Testing with complete user data:');
  sessionStorage.setItem('authUser', JSON.stringify({ 
    id: 1, 
    name: 'Test User',
    username: 'testuser',
    role: 'staff',
    permissions: ['view_inventory']
  }));
  console.log('- After setting complete data:', getAuthUser());
  console.log('- Display name:', getUserDisplayName());
  
  console.log('\n=== Tests Complete ===');
};

// Utility function to simulate login without backend
export const simulateLogin = (userData = {}) => {
  const defaultUser = {
    id: 1,
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    role: 'staff',
    permissions: ['view_inventory', 'manage_inventory']
  };
  
  const user = { ...defaultUser, ...userData };
  
  sessionStorage.setItem('authToken', 'test-token-' + Date.now());
  sessionStorage.setItem('authUser', JSON.stringify(user));
  
  console.log('Simulated login with user:', user);
  return user;
};

// Export for browser console use
window.authDebug = {
  runAuthTests,
  simulateLogin,
  clearAuthData,
  getAuthUser,
  isAuthenticated,
  getUserDisplayName
};