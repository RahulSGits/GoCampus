import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import socket from '../services/socket';

const StudentDashboard = () => {
  const [activeBuses, setActiveBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // GEU Campus Coordinates
  const CAMPUS_LAT = 30.2686;
  const CAMPUS_LNG = 78.0019;

  // Haversine ETA Calculation
  const calculateETA = (lat, lng) => {
    if (!lat || !lng) return '--';
    const R = 6371; // Earth's radius in km
    const dLat = (CAMPUS_LAT - lat) * (Math.PI / 180);
    const dLng = (CAMPUS_LNG - lng) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat * (Math.PI / 180)) * Math.cos(CAMPUS_LAT * (Math.PI / 180)) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const distanceKm = R * c; 
    
    // Assume average city speed 20km/h
    const timeHours = distanceKm / 20;
    const timeMinutes = Math.round(timeHours * 60);
    return timeMinutes <= 1 ? 'Arriving' : `${timeMinutes} min`;
  };

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5001' : '')}/api/buses`);
        const data = await response.json();
        
        const mapData = data
          .filter(bus => bus.status === 'On Route')
          .map(bus => ({
            id: bus._id,
            busNumber: bus.busNumber,
            driverName: bus.driverName,
            route: bus.route,
            lat: bus.currentLocation?.lat,
            lng: bus.currentLocation?.lng
          }));
          
        setActiveBuses(mapData);
        setLoading(false);
      } catch (err) {
        console.error("Failed fetching routing data", err);
        setLoading(false);
      }
    };
    
    fetchBuses();

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
    
    const handleBusUpdate = (updatedBus) => {
      setActiveBuses(prevBuses => {
        const exists = prevBuses.find(b => b.id === updatedBus.id);
        if (exists) {
          return prevBuses.map(b => b.id === updatedBus.id ? { 
            ...b, 
            lat: updatedBus.lat || b.lat, 
            lng: updatedBus.lng || b.lng,
            seats: updatedBus.seats !== undefined ? updatedBus.seats : b.seats
          } : b);
        } else {
          return [...prevBuses, updatedBus];
        }
      });
    };

    socket.on('busUpdate', handleBusUpdate);
    socket.on('adminAlert', handleAdminAlert);

    return () => {
       socket.off('busUpdate', handleBusUpdate);
       socket.off('adminAlert', handleAdminAlert);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar 
        role="Student" 
        userName="Student User" 
        unreadCount={unreadCount} 
        onNotificationClick={() => {
          setUnreadCount(0);
          document.getElementById('notifications-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex flex-col lg:flex-row gap-6">
        
        {/* Main Tracking Area */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Live Bus Tracking</h2>
              <p className="text-sm text-gray-500">View real-time locations of campus buses</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-200">
                {activeBuses.length} Buses Active
              </span>
            </div>
          </div>
          
          <div className="flex-1 bg-white rounded-xl shadow-sm border overflow-hidden relative min-h-[350px] lg:min-h-[500px]">
            {/* Embedded MapView */}
            <MapView buses={activeBuses} />
          </div>
        </div>

        {/* Sidebar Info Area */}
        <div className="w-full md:w-80 flex flex-col gap-6">
          
          {/* Active Fleet Status */}
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              🚍 Live Seat Availability
            </h3>
            {activeBuses.length === 0 ? (
                <p className="text-sm text-gray-500">No buses are actively broadcasting locations.</p>
            ) : (
                <ul className="space-y-4">
                  {activeBuses.map((bus) => (
                    <li key={bus.id} className="flex flex-col justify-start border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between w-full items-center mb-1">
                        <p className="font-bold text-sm text-blue-900">Bus {bus.busNumber || 'UK07'}</p>
                        <span className={`text-xs font-black shadow-sm px-2.5 py-1 rounded-md ${bus.seats > 5 ? 'bg-green-100 text-green-700 border border-green-200' : bus.seats > 0 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                          {bus.seats !== undefined ? `${bus.seats} Seats Left` : '--'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center w-full">
                        <p className="text-xs font-medium text-gray-500 flex items-center gap-1">📍 {bus.route || 'Unassigned Route'}</p>
                        <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          ETA: {calculateETA(bus.lat, bus.lng)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
            )}
          </div>

          {/* Schedule Summary */}
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              📅 Today's Schedule
            </h3>
            <ul className="space-y-3">
              <li className="flex justify-between items-start border-b pb-2">
                <div>
                  <p className="font-semibold text-sm">ISBT to Campus</p>
                  <p className="text-xs text-gray-500">Bus: UK07-1234</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">08:30 AM</p>
                </div>
              </li>
              <li className="flex justify-between items-start border-b pb-2">
                <div>
                  <p className="font-semibold text-sm">Clock Tower to Campus</p>
                  <p className="text-xs text-gray-500">Bus: UK07-5678</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">08:45 AM</p>
                </div>
              </li>
              <li className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm">Campus to ISBT</p>
                  <p className="text-xs text-gray-500">Evening Return</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">04:30 PM</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Notifications */}
          <div id="notifications-section" className="bg-white p-5 rounded-xl shadow-sm border flex-1">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              📣 Admin Notifications
            </h3>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {notifications.length === 0 && <p className="text-sm text-gray-500">No active alerts.</p>}
              {notifications.map((notif, idx) => (
                <div key={notif._id || idx} className={`p-3 rounded border-l-4 ${notif.type === 'warning' ? 'bg-yellow-50 border-yellow-500' : 'bg-blue-50 border-blue-500'}`}>
                  <p className={`text-sm font-medium ${notif.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'}`}>{notif.message}</p>
                  <p className={`text-xs mt-1 ${notif.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`}>
                    {notif.createdAt ? new Date(notif.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown Time'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default StudentDashboard;
