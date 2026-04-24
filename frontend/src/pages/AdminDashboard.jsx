import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import socket from '../services/socket';

const AdminDashboard = () => {
  // State
  const [stats, setStats] = useState([
    { label: 'Total Buses', value: '...', icon: '🚍', color: 'bg-blue-100 text-blue-800' },
    { label: 'Active Routes', value: '...', icon: '🛣️', color: 'bg-green-100 text-green-800' },
    { label: 'Registered Drivers', value: '...', icon: '👨‍✈️', color: 'bg-indigo-100 text-indigo-800' },
    { label: 'Registered Students', value: '...', icon: '🎓', color: 'bg-purple-100 text-purple-800' },
  ]);

  const [activeDrivers, setActiveDrivers] = useState([]);
  
  // Modal States
  const [showBusModal, setShowBusModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  
  // Form States
  const [newBus, setNewBus] = useState({ busNumber: '', capacity: '', driverName: '', route: 'Unassigned' });
  const [newRoute, setNewRoute] = useState({ name: '', description: '' });

  // Notifications State
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('info');
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleSendAlert = async (e) => {
    e.preventDefault();
    if (!alertMessage.trim()) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: alertMessage, type: alertType })
      });
      const savedAlert = await res.json();
      
      socket.emit('sendAdminAlert', savedAlert);
      setAlertMessage('');
      setTimeout(() => alert('Alert broadcasted successfully!'), 100);
    } catch (err) {
      console.error('Failed sending alert', err);
    }
  };

  useEffect(() => {
    // Analytics Hydration
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/analytics`)
      .then(res => res.json())
      .then(data => {
        setStats([
          { label: 'Total Buses', value: data.totalBuses || 0, icon: '🚍', color: 'bg-blue-100 text-blue-800' },
          { label: 'Active Routes', value: data.totalRoutes || 0, icon: '🛣️', color: 'bg-green-100 text-green-800' },
          { label: 'Registered Drivers', value: data.registeredDrivers || 0, icon: '👨‍✈️', color: 'bg-indigo-100 text-indigo-800' },
          { label: 'Registered Students', value: data.registeredStudents || 0, icon: '🎓', color: 'bg-purple-100 text-purple-800' }
        ]);
      })
      .catch(err => console.error("Analytics Error: ", err));

    // Initial Hydration from DataStore
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/buses`)
      .then(res => res.json())
      .then(data => {
        const tableData = data.map((bus) => ({
          id: bus._id,
          name: bus.driverName,
          bus: bus.busNumber,
          route: bus.route || 'Unassigned',
          status: bus.status,
          time: 'Active'
        }));
        setActiveDrivers(tableData);
      })
      .catch(err => console.error(err));
      
    // Real-Time Syncing across stack directly from Driver
    socket.on('busUpdate', (updatedBus) => {
      setActiveDrivers(prev => {
        const busExists = prev.find(d => d.id === updatedBus.id);
        if (busExists) {
            return prev.map(d => d.id === updatedBus.id ? { 
                ...d, 
                time: 'Live Now',
                seats: updatedBus.seats !== undefined ? updatedBus.seats : d.seats
            } : d);
        } else {
            return prev;
        }
      });
    });

    // Initial Notifications Fetch
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/notifications`)
      .then(res => res.json())
      .then(data => setAdminNotifications(data))
      .catch(err => console.error(err));

    const handleAdminAlert = (alert) => {
      setAdminNotifications(prev => [alert, ...prev]);
      setUnreadCount(prev => prev + 1);
    };
    socket.on('adminAlert', handleAdminAlert);

    return () => {
      socket.off('busUpdate');
      socket.off('adminAlert', handleAdminAlert);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar 
        role="Admin" 
        userName="System Admin" 
        unreadCount={unreadCount} 
        onNotificationClick={() => {
          setUnreadCount(0);
          document.getElementById('admin-alerts')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Options */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">System Overview</h2>
            <p className="text-gray-500 text-sm mt-1">Manage operations, fleet, and schedules.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowRouteModal(true)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center shadow-sm transition">
              <span className="mr-2">📝</span> Add Route
            </button>
            <button 
              onClick={() => setShowBusModal(true)}
              className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 flex items-center shadow-sm transition">
              <span className="mr-2">🚍</span> Add Bus
            </button>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Drivers Table List */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Active Fleet</h3>
              <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Driver / Bus</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Route</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Seats</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {activeDrivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                            {driver.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                            <div className="text-xs text-gray-500">{driver.bus}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{driver.route}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-800 bg-blue-100 rounded-lg">
                          {driver.seats !== undefined ? driver.seats : '--'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          driver.status === 'On Route' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {driver.status === 'On Route' ? <span className="mr-1 w-2 h-2 rounded-full bg-green-500 mt-1"></span> : null}
                          {driver.status}
                        </span>
                        <div className="text-xs text-gray-500 mt-1 ml-1">Update: {driver.time}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions & System Health */}
          <div className="space-y-6">
            <div id="admin-alerts" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">System Alerts</h3>
              
              <form onSubmit={handleSendAlert} className="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Broadcast Message</p>
                <div className="flex flex-col gap-2">
                  <input 
                    type="text" 
                    value={alertMessage}
                    onChange={(e) => setAlertMessage(e.target.value)}
                    placeholder="Enter alert message..." 
                    className="w-full text-sm p-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                  <div className="flex gap-2">
                    <select 
                      value={alertType} 
                      onChange={(e) => setAlertType(e.target.value)}
                      className="text-sm p-2 bg-white border border-gray-200 rounded-lg focus:outline-none"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                    </select>
                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition">
                      Send Alert
                    </button>
                  </div>
                </div>
              </form>

              <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {adminNotifications.length === 0 && <p className="text-sm text-gray-500">No active alerts.</p>}
                {adminNotifications.map((notif, idx) => (
                  <div key={notif._id || idx} className={`flex items-start gap-3 p-3 rounded-lg border ${notif.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
                    <span className="text-lg">{notif.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                    <div>
                      <p className="text-sm font-bold">{notif.message}</p>
                      <p className={`text-xs mt-1 ${notif.type === 'warning' ? 'text-yellow-700' : 'text-blue-700'}`}>
                        {new Date(notif.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-tr from-gray-800 relative overflow-hidden to-gray-900 p-6 rounded-2xl shadow-lg text-white border border-gray-700">
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-2">Need a Report?</h3>
                <p className="text-gray-300 text-sm mb-4">Download the latest monthly analytics report detailing attendance and GPS tracking.</p>
                <button 
                  onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8,ID,Name,Bus,Route,Status\n" + 
                                       activeDrivers.map(d => `${d.id},${d.name},${d.bus},${d.route},${d.status}`).join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", "gocampus_report.csv");
                    document.body.appendChild(link);
                    link.click();
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 py-2 rounded-lg font-bold text-sm shadow-md transition">
                  Export CSV Data
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Modals natively persisting to Backend Data sources */}
      {showBusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Bus</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/buses`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(newBus)
                });
                if(res.ok) {
                    alert('Bus added successfully!');
                    setShowBusModal(false);
                    window.location.reload(); // Quick refresh to pull db
                }
              } catch (err) { alert(err) }
            }}>
              <div className="space-y-4">
                <input required placeholder="Bus Number (e.g., UK07-1111)" className="w-full border p-2 rounded" onChange={e => setNewBus({...newBus, busNumber: e.target.value})} />
                <input required type="number" placeholder="Capacity (e.g., 40)" className="w-full border p-2 rounded" onChange={e => setNewBus({...newBus, capacity: e.target.value})} />
                <input required placeholder="Assign Driver Name" className="w-full border p-2 rounded" onChange={e => setNewBus({...newBus, driverName: e.target.value})} />
              </div>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setShowBusModal(false)} className="flex-1 bg-gray-100 p-2 rounded text-gray-700">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 p-2 rounded text-white">Save Bus</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRouteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Transit Route</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/routes`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(newRoute)
                });
                if(res.ok) {
                    alert('Route created successfully!');
                    setShowRouteModal(false);
                }
              } catch (err) { alert(err) }
            }}>
              <div className="space-y-4">
                <input required placeholder="Route Name (e.g., ISBT to GEU)" className="w-full border p-2 rounded" onChange={e => setNewRoute({...newRoute, name: e.target.value})} />
                <textarea placeholder="Route Description" className="w-full border p-2 rounded" onChange={e => setNewRoute({...newRoute, description: e.target.value})}></textarea>
              </div>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setShowRouteModal(false)} className="flex-1 bg-gray-100 p-2 rounded text-gray-700">Cancel</button>
                <button type="submit" className="flex-1 bg-green-600 p-2 rounded text-white">Save Route</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
