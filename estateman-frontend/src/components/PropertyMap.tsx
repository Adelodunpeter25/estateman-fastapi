import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from "@/components/ui/card";

interface Property {
  id: string;
  address: string;
  city: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  status: string;
  type: string;
  agent: string;
  daysListed: number;
  images: string[];
  virtual_tour: boolean;
  coordinates: { lat: number; lng: number };
}

interface PropertyMapProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ properties, onPropertySelect }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN_HERE'; // Replace with actual token
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-73.9851, 40.7589], // NYC center
      zoom: 12,
    });

    // Add markers for each property
    properties.forEach((property) => {
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-bold">${property.address}</h3>
          <p class="text-sm text-gray-600">${property.city}</p>
          <p class="font-semibold text-green-600">$${property.price.toLocaleString()}</p>
          <p class="text-xs">${property.beds} bed • ${property.baths} bath • ${property.sqft} sqft</p>
          <p class="text-xs mt-1">
            <span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              ${property.status}
            </span>
          </p>
        </div>
      `);

      const marker = new mapboxgl.Marker({
        color: property.status === 'Active' ? '#10B981' : 
               property.status === 'Pending' ? '#F59E0B' : '#6B7280'
      })
        .setLngLat([property.coordinates.lng, property.coordinates.lat])
        .setPopup(popup)
        .addTo(map.current!);

      marker.getElement().addEventListener('click', () => {
        onPropertySelect?.(property);
      });
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [properties, onPropertySelect]);

  return (
    <Card className="h-[600px] overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute top-4 left-4 bg-white p-2 rounded shadow-lg text-xs">
        <p><span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span> Active</p>
        <p><span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1"></span> Pending</p>
        <p><span className="inline-block w-3 h-3 bg-gray-500 rounded-full mr-1"></span> Sold</p>
      </div>
    </Card>
  );
};

export default PropertyMap;