import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Plus, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  History, 
  Tag, 
  FileSpreadsheet, 
  User, 
  LogOut,
  CheckSquare,
  Bell,
  Settings
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";

const Sidebar = () => {
  const navigate = useNavigate();
  
  const getAuthUser = () => {
    try {
      const userData = sessionStorage.getItem('authUser');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      // Clear corrupted data
      sessionStorage.removeItem('authUser');
      sessionStorage.removeItem('authToken');
      return null;
    }
  };

  const user = getAuthUser();
  const { getStoreName } = useSettings();

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('authUser');
    navigate('/login');
  };

  // If user data is corrupted or missing, redirect to login
  React.useEffect(() => {
    if (!user && sessionStorage.getItem('authToken')) {
      // Token exists but user data is corrupted
      sessionStorage.removeItem('authToken');
      navigate('/login');
    }
  }, [user, navigate]);

  const isAdmin = user?.role === 'admin';

  const navigationItems = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
      permission: null // All users
    },
    {
      path: "/view-items",
      name: isAdmin ? "View Items" : "Sales",
      icon: Package,
      permission: isAdmin ? "manage_inventory" : "process_sales"
    },
    {
      path: "/add-item",
      name: "Add Item",
      icon: Plus,
      permission: "manage_inventory"
    },
    {
      path: "/categories",
      name: "Categories",
      icon: Tag,
      permission: "manage_inventory"
    },
    {
      path: "/low-stock",
      name: "Low Stock",
      icon: AlertTriangle,
      permission: "admin_only" // Only admins can access low stock page
    },

    {
      path: "/sales-history",
      name: "Sales History",
      icon: History,
      permission: "view_sales_history"
    },
    {
      path: "/approvals",
      name: "Approvals",
      icon: CheckSquare,
      permission: "approve_uploads",
      badge: null // Pending count removed as per new_code
    },
    {
      path: "/profile",
      name: "Profile",
      icon: User,
      permission: null // All users
    },
    {
      path: "/settings",
      name: "Settings",
      icon: Settings,
      permission: "manage_system"
    }
  ];

  return (
    <div className="w-72 bg-white shadow-lg flex flex-col min-h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">{getStoreName()}</h1>
            <p className="text-xs text-gray-500 capitalize">{user?.role || 'guest'}</p>
          </div>
        </div>
      </div>
      {/* User Info */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{user?.name || 'Unknown User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email || 'No email'}</p>
          </div>
        </div>
      </div>
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          // Check if user can access this item
          const canAccess = 
            isAdmin || 
            !item.permission || 
            (item.permission === "admin_only" && isAdmin) ||
            (user?.permissions && user.permissions.includes(item.permission));
          
          if (canAccess) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${isActive ? 'bg-blue-100 text-blue-800 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          }
          return null;
        })}
        {/* User Management link for admins only */}
        {isAdmin && (
          <NavLink
            to="/user-management"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${isActive ? 'bg-blue-100 text-blue-800 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`
            }
          >
            <User className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">User Management</span>
          </NavLink>
        )}
      </nav>
      {/* Logout */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="truncate">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
