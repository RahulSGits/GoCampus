import React, { useState, useEffect, useContext } from 'react';
import socket from '../services/socket';
import { AuthContext } from '../context/AuthContext';

const DriverDashboard = () => {
  const { user } = useContext(AuthContext);
  const [availableSeats, setAvailableSeats] = useState(38);
  const [lastUpdated, setLastUpdated] = useState('just now');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const seatsRef = React.useRef(availableSeats);

  useEffect(() => {
    seatsRef.current = availableSeats;
  }, [availableSeats]);

  useEffect(() => {
    let latOffset = 30.2686;
    let lngOffset = 78.0019;
    
    // Simulate active movement relative to GEU
    const driveInterval = setInterval(() => {
       latOffset += (Math.random() - 0.5) * 0.001;
       lngOffset += (Math.random() - 0.5) * 0.001;
       
       socket.emit('updateLocation', {
         id: '6543b591b3fa1d88abcd9012', // dummy mongo ID for UK07-1234
         lat: latOffset,
         lng: lngOffset,
         seats: seatsRef.current
       });
    }, 3000);

    // Fetch Persistent Notifications
    fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5001' : '')}/api/notifications`)
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(err => console.error(err));
    
    // Listen for live Admin Notifications
    const handleAdminAlert = (alert) => {
      setNotifications(prev => [alert, ...prev]);
      setUnreadCount(prev => prev + 1);
    };
    
    socket.on('adminAlert', handleAdminAlert);

    return () => {
      clearInterval(driveInterval);
      socket.off('adminAlert', handleAdminAlert);
    }
  }, []);

  const handleDecrease = () => {
    if (availableSeats > 0) {
      setAvailableSeats(prev => prev - 1);
      setLastUpdated('just now');
      // Force instant emission on tap
      socket.emit('updateLocation', { id: '6543b591b3fa1d88abcd9012', seats: availableSeats - 1, instant: true });
    }
  };

  const handleIncrease = () => {
    setAvailableSeats(prev => prev + 1);
    setLastUpdated('just now');
    // Force instant emission on tap
    socket.emit('updateLocation', { id: '6543b591b3fa1d88abcd9012', seats: availableSeats + 1, instant: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans relative overflow-hidden">
      {/* Background faint map pattern simulation */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }}></div>

      {/* Top Bar */}
      <div className="z-10 flex justify-between items-start p-6">
        <div>
          <div className="inline-flex items-center bg-white rounded-full shadow-sm border border-gray-100 px-3 py-1 mb-6">
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full mr-2">DRIVER</span>
            <span className="text-sm font-semibold text-gray-700">
              {user?.name || 'Driver'} • Bus {"UK07-1234"}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Driver Console</h1>
          <p className="text-gray-500 font-medium mt-1">Update your bus status below</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button 
            onClick={() => {
              setUnreadCount(0);
              document.getElementById('driver-notifications')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="relative bg-white p-3 rounded-full shadow-sm border border-gray-100 text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition"
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
          
          <button className="bg-white p-3 rounded-full shadow-sm border border-gray-100 text-red-500 hover:bg-red-50 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Center Content */}
      <div className="flex-1 z-10 flex flex-col items-center justify-center p-6">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Available Seats</h2>
        
        <div className="text-7xl md:text-[12rem] font-black text-[#1d2b36] leading-none tracking-tighter mb-8">
          {availableSeats}
        </div>

        <div className="flex gap-6 mb-8">
          <button 
            onClick={handleDecrease}
            className="w-32 h-16 bg-red-100 hover:bg-red-200 text-red-600 rounded-2xl flex items-center justify-center text-4xl font-light transition-colors"
          >
            -
          </button>
          <button 
            onClick={handleIncrease}
            className="w-32 h-16 bg-green-100 hover:bg-green-200 text-green-600 rounded-2xl flex items-center justify-center text-4xl font-light transition-colors"
          >
            +
          </button>
        </div>

        <p className="text-sm text-gray-400 font-medium">Last updated: {lastUpdated}</p>
      </div>

      {/* Admin Notifications Section */}
      <div id="driver-notifications" className="z-10 relative md:absolute bottom-0 md:bottom-6 left-0 md:left-6 right-0 p-6 md:p-0 md:right-auto md:w-96">
        <div className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg rounded-2xl p-5">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
            <span>📣</span> Admin Notifications
          </h3>
          <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {notifications.length === 0 && <p className="text-sm text-gray-500">No active alerts.</p>}
            {notifications.map((notif, idx) => (
              <div key={notif._id || idx} className={`p-3 rounded-lg border-l-4 ${notif.type === 'warning' ? 'bg-yellow-50 border-yellow-500' : 'bg-blue-50 border-blue-500'}`}>
                <p className={`text-sm font-medium ${notif.type === 'warning' ? 'text-yellow-900' : 'text-blue-900'}`}>{notif.message}</p>
                <p className={`text-xs mt-1 ${notif.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`}>
                  {notif.createdAt ? new Date(notif.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown Time'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default DriverDashboard;
