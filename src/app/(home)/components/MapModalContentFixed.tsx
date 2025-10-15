'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import type { Home } from '@/types/home';
import { filterHomesByPolygon } from './usePolygonFilter';
import type { ModalProps } from './MapModal';

const ClientSideMap = dynamic(() => import('./ClientSideMap'), {
   ssr: false,
   loading: () => (
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
   )
});

export default function MapModalContent({
   open,
   onClose,
   homes,
   onApply,
   initialPolygon,
}: ModalProps) {

   const [tempRing, setTempRing] = useState<[number, number][] | undefined>(
      initialPolygon
   );
   const [tempFiltered, setTempFiltered] = useState<Home[]>(
      initialPolygon ? filterHomesByPolygon(homes, initialPolygon) : homes
   );

   useEffect(() => {
      if (open) {
         setTempRing(initialPolygon);
         setTempFiltered(
            initialPolygon ? filterHomesByPolygon(homes, initialPolygon) : homes
         );
      }
   }, [open, homes, initialPolygon]);

   const handleApply = () => {
      onApply(tempRing ? tempFiltered : homes, tempRing);
      onClose();
   };

   const handleClear = () => {
      setTempRing(undefined);
      setTempFiltered(homes);
   };

   if (!open) return null;

   return (
      <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
         <Dialog.Portal>
            <Dialog.Overlay
               className="fixed inset-0"
               style={{ background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
            />
            <Dialog.Content
               className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
               style={{
                  zIndex: 50,
                  width: '880px',
                  height: '360px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  border: '1px solid #e5e7eb',
                  background: '#fff'
               }}
            >
               <VisuallyHidden.Root>
                  <Dialog.Title>Map Filter - Draw Polygon to Filter Properties</Dialog.Title>
               </VisuallyHidden.Root>

               <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <ClientSideMap
                     homes={homes}
                     tempRing={tempRing}
                     tempFiltered={tempFiltered}
                     setTempRing={setTempRing}
                     setTempFiltered={setTempFiltered}
                     initialPolygon={initialPolygon}
                  />

                  {/* top-right controls */}
                  <div
                     style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        display: 'flex',
                        gap: 6,
                        zIndex: 1000,
                     }}
                  >
                     <span
                        style={{
                           padding: '6px 8px',
                           background: 'rgba(255,255,255,0.95)',
                           border: '1px solid #e5e7eb',
                           borderRadius: 6,
                           fontSize: 11,
                           fontWeight: 500,
                           boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                     >
                        {tempRing
                           ? `${tempFiltered.length.toLocaleString()} results in area`
                           : `${homes.length.toLocaleString()} total homes`}
                     </span>
                     <button
                        onClick={handleClear}
                        style={{
                           padding: '6px 10px',
                           background: 'rgba(255,255,255,0.95)',
                           borderRadius: 6,
                           border: '1px solid #e5e7eb',
                           fontSize: 11,
                           fontWeight: 500,
                           cursor: 'pointer',
                           boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                     >
                        Clear
                     </button>
                     <button
                        onClick={onClose}
                        style={{
                           padding: '6px 10px',
                           background: '#fff',
                           borderRadius: 6,
                           border: '1px solid #e5e7eb',
                           fontSize: 11,
                           fontWeight: 500,
                           cursor: 'pointer',
                           boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                     >
                        Cancel
                     </button>
                     <button
                        onClick={handleApply}
                        style={{
                           padding: '6px 10px',
                           background: '#22c55e',
                           color: '#fff',
                           borderRadius: 6,
                           border: '1px solid #22c55e',
                           fontSize: 11,
                           fontWeight: 500,
                           cursor: 'pointer',
                           boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                     >
                        Apply
                     </button>
                  </div>
               </div>
            </Dialog.Content>
         </Dialog.Portal>
      </Dialog.Root>
   );
}