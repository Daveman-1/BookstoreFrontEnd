import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 w-full">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="text-8xl font-bold text-gray-200 mb-4">404</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h1>
          <p className="text-gray-600 text-lg">
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="btn-primary flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate(-1)}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/view-items")}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center"
            >
              <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-medium">View Items</p>
              <p className="text-sm text-gray-600">Browse inventory</p>
            </button>
            
            <button
              onClick={() => navigate("/add-item")}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center"
            >
              <Home className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="font-medium">Add Item</p>
              <p className="text-sm text-gray-600">Add new product</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
