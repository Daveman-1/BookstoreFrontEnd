import React, { useEffect, useState } from "react";
import { User } from "lucide-react";
import { getUserDisplayName, getAuthUser, isAuthenticated } from "../utils/authHelpers";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('User');
  const navigate = useNavigate();

  useEffect(() => {
    // Validate authentication on component mount
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }

    const userData = getAuthUser();
    if (!userData) {
      navigate('/login', { replace: true });
      return;
    }

    setUser(userData);
    setDisplayName(getUserDisplayName());
  }, [navigate]);

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-800">
            Welcome back, {displayName}!
          </h1>
        </div>
        {/* Right side intentionally left blank */}
      </div>
    </header>
  );
};

export default Header;
