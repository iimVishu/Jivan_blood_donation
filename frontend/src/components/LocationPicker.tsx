'use client';

import { useState, useEffect } from 'react';
import { MapPin, Copy } from 'lucide-react';

interface LocationPickerProps {
  onLocationChange: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function LocationPicker({ onLocationChange, initialLat = 28.7041, initialLng = 77.1025 }: LocationPickerProps) {
  const [latitude, setLatitude] = useState<string>(initialLat.toString());
  const [longitude, setLongitude] = useState<string>(initialLng.toString());
  const [error, setError] = useState('');

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLatitude(value);
    if (value && !Number.isNaN(parseFloat(value))) {
      const lng = parseFloat(longitude);
      if (!Number.isNaN(lng)) {
        setError('');
        onLocationChange(parseFloat(value), lng);
      }
    }
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLongitude(value);
    if (value && !Number.isNaN(parseFloat(value))) {
      const lat = parseFloat(latitude);
      if (!Number.isNaN(lat)) {
        setError('');
        onLocationChange(lat, parseFloat(value));
      }
    }
  };

  const handleGetCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatitude(lat.toString());
          setLongitude(lng.toString());
          onLocationChange(lat, lng);
          setError('');
        },
        (error) => {
          setError('Failed to get current location. Please enable location access.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-red-600" />
        <h3 className="font-semibold text-gray-900">Blood Bank Location</h3>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latitude
          </label>
          <input
            type="number"
            step="0.0001"
            placeholder="28.7041"
            value={latitude}
            onChange={handleLatChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">e.g., 28.7041</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longitude
          </label>
          <input
            type="number"
            step="0.0001"
            placeholder="77.1025"
            value={longitude}
            onChange={handleLngChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">e.g., 77.1025</p>
        </div>
      </div>

      <div className="pt-2 space-y-2">
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
        >
          📍 Use Current Location
        </button>
        
        <a
          href="https://maps.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full px-3 py-2 bg-gray-200 text-gray-900 rounded-md text-sm hover:bg-gray-300 text-center transition-colors"
        >
          🗺️ Find on Google Maps
        </a>
      </div>

      <div className="text-xs text-gray-600 bg-white p-3 rounded border border-gray-200">
        <p className="font-semibold mb-1">How to find coordinates:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Open Google Maps and search for your blood bank location</li>
          <li>Right-click on the exact location and click on the coordinates</li>
          <li>Copy the latitude and longitude values and paste them above</li>
        </ol>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
        <p className="text-blue-900"><strong>Current Location:</strong></p>
        <p className="text-blue-800 font-mono text-sm">{latitude}, {longitude}</p>
      </div>
    </div>
  );
}
