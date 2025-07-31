import React from "react";
import { User } from "lucide-react";

const Header = () => {
  const user = JSON.parse(sessionStorage.getItem('authUser'));

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-800">
            Welcome back, {user?.name}!
          </h1>
        </div>
        {/* Right side intentionally left blank */}
      </div>
    </header>
  );
};

export default Header;
