'use client';

import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import type { ReactNode } from 'react';

const SafeMarkerClusterGroup = ({ children, ...props }: {
   children: ReactNode;
   chunkedLoading?: boolean;
}) => {
   const [MarkerClusterGroupComponent, setMarkerClusterGroupComponent] = useState<any>(null);
   const [isLoaded, setIsLoaded] = useState(false);
   const [isMapReady, setIsMapReady] = useState(false);

   let map;
   try {
      map = useMap();
   } catch (error) {
      console.warn('SafeMarkerClusterGroup not in MapContainer context:', error);
      return <>{children}</>;
   }

   useEffect(() => {
      if (map) {
         setIsMapReady(true);
      }
   }, [map]);

   useEffect(() => {
      if (typeof window !== 'undefined' && !isLoaded && isMapReady) {
         import('@changey/react-leaflet-markercluster')
            .then((module) => {
               setMarkerClusterGroupComponent(() => module.default);
               setIsLoaded(true);
            })
            .catch((error) => {
               console.warn('MarkerClusterGroup failed to load, using fallback:', error);
               setMarkerClusterGroupComponent(() => ({ children }: any) => <>{children}</>);
               setIsLoaded(true);
            });
      }
   }, [isLoaded, isMapReady]);

   if (!isMapReady || !MarkerClusterGroupComponent) {
      return <>{children}</>;
   }

   const clusterOptions = {
      chunkedLoading: true,
      chunkProgress: () => { },
      maxClusterRadius: 40,
      ...props
   };

   return <MarkerClusterGroupComponent {...clusterOptions}>{children}</MarkerClusterGroupComponent>;
};

export default SafeMarkerClusterGroup;