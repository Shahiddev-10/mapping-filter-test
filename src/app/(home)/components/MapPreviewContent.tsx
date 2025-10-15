'use client';

import { useEffect, useState } from 'react';
import 'leaflet-defaulticon-compatibility';
import { MapContainer, TileLayer, Polygon, Marker, useMap } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import * as L from 'leaflet';
import type { Home } from '@/types/home';
import SafeMarkerClusterGroup from './SafeMarkerClusterGroup';

type Props = {
   polygon?: [number, number][];
   onClick: () => void;
   filteredHomes?: Home[];
};

function BoundsUpdater({ polygon, filteredHomes }: { polygon?: [number, number][], filteredHomes?: Home[] }) {
   const map = useMap();

   useEffect(() => {
      if (polygon && polygon.length > 2) {
         const bounds = L.latLngBounds(polygon.map(([lng, lat]) => [lat, lng]));
         map.fitBounds(bounds, { padding: [10, 10] });
      } else if (filteredHomes && filteredHomes.length > 0) {
         const bounds = L.latLngBounds(filteredHomes.map(home => [home.lat, home.lng]));
         map.fitBounds(bounds, { padding: [10, 10] });
      }
   }, [map, polygon, filteredHomes]);

   return null;
}

export default function MapPreviewContent({ polygon, onClick, filteredHomes }: Props) {
   const [mounted, setMounted] = useState(false);

   useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
   }, []);

   if (!mounted) {
      return (
         <div
            style={{
               position: 'absolute',
               top: 24,
               right: 24,
               width: 260,
               height: 160,
               borderRadius: 12,
               overflow: 'hidden',
               border: '1px solid #e5e7eb',
               boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
               cursor: 'pointer',
               zIndex: 10,
               background: '#f3f4f6',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               fontSize: 12,
               color: '#6b7280',
            }}
            onClick={onClick}
         >
            Loading...
         </div>
      );
   }

   return (
      <div
         style={{
            position: 'absolute',
            top: 24,
            right: 24,
            width: 260,
            height: 160,
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            cursor: 'pointer',
            zIndex: 10,
            background: '#fff',
         }}
         onClick={onClick}
         aria-label="Open map filter"
         title="Open map filter"
      >
         <MapContainer
            center={[59.9139, 10.7522]}
            zoom={8}
            style={{ height: '100%', width: '100%' }}
            key={`map-${polygon ? polygon.length : 'no-polygon'}-${filteredHomes ? filteredHomes.length : 'no-homes'}`}
         >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <BoundsUpdater polygon={polygon} filteredHomes={filteredHomes} />
            {polygon && (
               <Polygon
                  positions={polygon.map(([lng, lat]) => [lat, lng]) as LatLngTuple[]}
                  pathOptions={{ weight: 2, color: '#111', fillOpacity: 0.1 }}
               />
            )}
            {mounted && filteredHomes && filteredHomes.length > 0 ? (
               filteredHomes.length > 50 ? (
                  <SafeMarkerClusterGroup key={`markers-${filteredHomes.length}`}>
                     {filteredHomes.map((home) => (
                        <Marker
                           key={home.id}
                           position={[home.lat, home.lng] as LatLngTuple}
                        />
                     ))}
                  </SafeMarkerClusterGroup>
               ) : (
                  filteredHomes.map((home) => (
                     <Marker
                        key={home.id}
                        position={[home.lat, home.lng] as LatLngTuple}
                     />
                  ))
               )
            ) : null}
         </MapContainer>
         {polygon && (
            <div
               style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  padding: '2px 8px',
                  fontSize: 12,
                  background: '#111',
                  color: '#fff',
                  borderRadius: 999,
               }}
            >
               {filteredHomes ? `${filteredHomes.length.toLocaleString()} results` : 'Filter active'}
            </div>
         )}
         {!polygon && (
            <div
               style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  right: 8,
                  textAlign: 'center',
                  padding: '4px 8px',
                  fontSize: 11,
                  background: 'rgba(255,255,255,0.9)',
                  color: '#6b7280',
                  borderRadius: 4,
               }}
            >
               Click to open map filter
            </div>
         )}
      </div>
   );
}
