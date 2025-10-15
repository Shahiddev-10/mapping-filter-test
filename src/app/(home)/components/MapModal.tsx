'use client';
import dynamic from 'next/dynamic';
import type { Home } from '@/types/home';

const MapModalContent = dynamic(() => import('./MapModalContentFixed'), { ssr: false });

export type ModalProps = {
   open: boolean;
   homes: Home[];
   onClose: () => void;
   onApply: (filtered: Home[], ring?: [number, number][]) => void;
   initialPolygon?: [number, number][];
};

export default function MapModal(props: ModalProps) {
   return <MapModalContent {...props} />;
}
