import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col min-h-screen">
      <div className="p-4 text-center font-bold text-2xl border-b border-gray-700">
        GoCampus Menu
      </div>
      <nav className="flex-1 p-4 flex flex-col gap-2">
        <Link to="/admin" className="p-2 hover:bg-gray-700 rounded transition">⚙️ Admin Dashboard</Link>
        <Link to="/driver" className="p-2 hover:bg-gray-700 rounded transition">🚌 Driver Console</Link>
        <Link to="/student" className="p-2 hover:bg-gray-700 rounded transition">👨‍🎓 Student View</Link>
      </nav>
      <div className="p-4 border-t border-gray-700 text-sm text-gray-400 text-center">
        GoCampus System v1.0
      </div>
    </div>
  );
};

export default Sidebar;
