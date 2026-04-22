import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ role, userName, unreadCount = 0, onNotificationClick }) => {
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
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-lg sm:text-xl font-bold text-blue-600">GoCampus</span>
            <span className="bg-blue-100 text-blue-800 text-[10px] sm:text-xs px-2 py-1 rounded uppercase font-semibold">
              {role}
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Notification Bell */}
            <button 
              onClick={onNotificationClick}
              className="relative p-2 text-gray-600 hover:text-blue-600 transition focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </button>

            <div className="hidden sm:block text-sm font-medium text-gray-700">
              Welcome, {userName || 'User'}
            </div>
            <button 
              onClick={handleLogout}
              className="text-xs sm:text-sm text-red-600 hover:text-white hover:bg-red-600 px-2 sm:px-3 py-1.5 border border-red-200 rounded transition font-medium"
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
