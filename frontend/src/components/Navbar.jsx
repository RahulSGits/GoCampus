import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ role, userName }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-blue-600">GoCampus</span>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded uppercase font-semibold">
              {role} Panel
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-700">
              Welcome, {userName || 'User'}
            </div>
            <button 
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-white hover:bg-red-600 px-3 py-1.5 border border-red-200 rounded transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
