import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leafet default marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Graphic Era University coordinates
const GEU_LAT = 30.2686;
const GEU_LNG = 78.0019;

const MapView = ({ buses = [], center = [GEU_LAT, GEU_LNG] }) => {
  return (
    <div className="w-full h-full min-h-[400px] z-0 rounded-lg overflow-hidden border shadow-sm relative">
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {buses.map((bus) => (
          <Marker key={bus.id} position={[bus.lat, bus.lng]}>
            <Popup>
              <div className="font-sans">
                <h3 className="font-bold text-gray-900 border-b pb-1 mb-1">
                  Bus {bus.busNumber}
                </h3>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Driver:</span> {bus.driverName}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Route:</span> {bus.route || 'Unassigned'}
                </p>
                {bus.seats !== undefined && (
                  <p className="text-sm text-blue-700 mt-1 bg-blue-50 px-2 py-1 flex justify-between items-center rounded border border-blue-100">
                    <span className="font-semibold">Available Seats:</span>
                    <span className="font-bold text-base">{bus.seats}</span>
                  </p>
                )}
                <p className="text-xs text-green-600 font-bold mt-2">
                  Status: Active
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
