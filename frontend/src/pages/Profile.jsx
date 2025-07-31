import React, { useState, useEffect } from "react";
import { authService } from '../services/authService';

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const result = await authService.getProfile();
      if (result.success) setUser(result.user);
    };
    fetchProfile();
  }, []);

  if (!user) {
    return <div className="p-6">No user info available.</div>;
  }

  return (
    <div className="p-2 sm:p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-4">Profile</h1>
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full max-w-xs sm:max-w-md">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>
    </div>
  );
};

export default Profile; 