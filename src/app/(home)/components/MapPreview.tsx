'use client';

import dynamic from 'next/dynamic';
import type { LatLngTuple } from 'leaflet';
import type { Home } from '@/types/home';

type Props = {
   polygon?: [number, number][];
   onClick: () => void;
   filteredHomes?: Home[];
};

const MapContent = dynamic<Props>(() => import('./MapPreviewContent'), { ssr: false });

export default function MapPreview({ polygon, onClick, filteredHomes }: Props) {
   return <MapContent polygon={polygon} onClick={onClick} filteredHomes={filteredHomes} />;
}
