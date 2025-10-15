'use client';

import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-defaulticon-compatibility';
import { MapContainer, TileLayer, Marker, useMap, Polygon } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import type { Home } from '@/types/home';
import { filterHomesByPolygon } from './usePolygonFilter';

// Define proper event constants
const DRAW_EVENTS = {
   CREATED: 'draw:created',
   EDITED: 'draw:edited',
   DELETED: 'draw:deleted'
} as const;

function DrawController({
   homes,
   setTempRing,
   setTempFiltered,
   initialPolygon,
}: {
   homes: Home[];
   setTempRing: (r?: [number, number][]) => void;
   setTempFiltered: (rows: Home[]) => void;
   initialPolygon?: [number, number][];
}) {
   const map = useMap();
   const drawnItems = useRef<L.FeatureGroup>(new L.FeatureGroup());
   const isInitialized = useRef(false);

   useEffect(() => {
      if (isInitialized.current) return;
      isInitialized.current = true;

      map.addLayer(drawnItems.current);

      const drawControl = new L.Control.Draw({
         draw: {
            polygon: {
               allowIntersection: false,
               drawError: {
                  color: '#e1e100',
                  message: '<strong>Polygon intersects!</strong>'
               },
               shapeOptions: {
                  color: '#111',
                  weight: 2,
                  fillOpacity: 0.2
               }
            },
            rectangle: false,
            polyline: false,
            marker: false,
            circle: false,
            circlemarker: false,
         },
         edit: {
            featureGroup: drawnItems.current,
            remove: true
         },
      });
      map.addControl(drawControl);

      // preload polygon if exists
      if (initialPolygon && initialPolygon.length > 2) {
         const latlngs = initialPolygon.map(([lng, lat]) => L.latLng(lat, lng));
         const poly = L.polygon(latlngs);
         drawnItems.current.addLayer(poly);
         map.fitBounds(poly.getBounds(), { padding: [40, 40] });

         const ring: [number, number][] = latlngs.map((p) => [p.lng, p.lat]);
         setTempRing(ring);
         setTempFiltered(filterHomesByPolygon(homes, ring));
      } else if (homes.length) {
         const b = L.latLngBounds(
            homes.map((h) => [h.lat, h.lng] as [number, number])
         );
         if (b.isValid()) map.fitBounds(b.pad(0.2));
      }

      const onCreated = (e: any) => {
         drawnItems.current.clearLayers();
         drawnItems.current.addLayer(e.layer);
         const ring: [number, number][] = (
            e.layer.getLatLngs()[0] as L.LatLng[]
         ).map((p) => [p.lng, p.lat]);
         setTempRing(ring);
         const filtered = filterHomesByPolygon(homes, ring);
         setTempFiltered(filtered);
      };

      const onEdited = (e: any) => {
         let ring: [number, number][] | undefined;
         e.layers.eachLayer((layer: any) => {
            if (layer instanceof L.Polygon) {
               ring = (layer.getLatLngs()[0] as L.LatLng[]).map((p) => [
                  p.lng,
                  p.lat,
               ]);
            }
         });
         if (ring) {
            setTempRing(ring);
            const filtered = filterHomesByPolygon(homes, ring);
            setTempFiltered(filtered);
         }
      };

      const onDeleted = () => {
         setTempRing(undefined);
         setTempFiltered(homes);
      };

      // Use proper event names instead of L.Draw.Event
      map.on(DRAW_EVENTS.CREATED, onCreated);
      map.on(DRAW_EVENTS.EDITED, onEdited);
      map.on(DRAW_EVENTS.DELETED, onDeleted);

      return () => {
         map.off(DRAW_EVENTS.CREATED, onCreated);
         map.off(DRAW_EVENTS.EDITED, onEdited);
         map.off(DRAW_EVENTS.DELETED, onDeleted);
         map.removeControl(drawControl);
         map.removeLayer(drawnItems.current);
         isInitialized.current = false;
      };
   }, [map, homes, setTempRing, setTempFiltered, initialPolygon]);

   return null;
}

interface ClientSideMapProps {
   homes: Home[];
   tempRing?: [number, number][];
   tempFiltered: Home[];
   setTempRing: (r?: [number, number][]) => void;
   setTempFiltered: (rows: Home[]) => void;
   initialPolygon?: [number, number][];
}

export default function ClientSideMap({
   homes,
   tempRing,
   tempFiltered,
   setTempRing,
   setTempFiltered,
   initialPolygon,
}: ClientSideMapProps) {
   const [isClient, setIsClient] = useState(false);

   useEffect(() => {
      setIsClient(true);
   }, []);

   const markers = (tempRing ? tempFiltered : homes).map((h) => (
      <Marker key={h.id} position={[h.lat, h.lng] as LatLngTuple} />
   ));

   if (!isClient) {
      return (
         <div style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f3f4f6'
         }}>
            Loading map...
         </div>
      );
   }

   return (
      <MapContainer
         style={{ height: '100%', width: '100%' }}
         center={[59.9139, 10.7522]}
         zoom={9}
      >
         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
         <DrawController
            homes={homes}
            setTempRing={setTempRing}
            setTempFiltered={setTempFiltered}
            initialPolygon={initialPolygon}
         />

         {markers}

         {tempRing && tempRing.length > 2 && (
            <Polygon
               positions={
                  tempRing.map(([lng, lat]) => [lat, lng]) as LatLngTuple[]
               }
               pathOptions={{ weight: 2, color: '#111', fillOpacity: 0.2 }}
            />
         )}
      </MapContainer>
   );
}