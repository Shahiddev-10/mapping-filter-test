'use client';

import { useEffect, useMemo, useState } from 'react';
import { Home } from '@/types/home';
import HomeTable from './components/HomeTable';
import MapPreview from './components/MapPreview';
import MapModal from './components/MapModal';
import homesData from '@/../public/1000_homes.json';
import { filterHomesByPolygon } from './components/usePolygonFilter';

const STORAGE_KEY = 'mapFilter.polygon.v1';

export default function Page() {
  const ALL = homesData as Home[];

  const [rows, setRows] = useState<Home[]>(ALL);
  const [polygon, setPolygon] = useState<[number, number][] | undefined>();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const ring = JSON.parse(raw) as [number, number][];
      if (Array.isArray(ring) && ring.length >= 3) {
        setPolygon(ring);
        setRows(filterHomesByPolygon(ALL, ring));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []); // run once

  const total = useMemo(() => rows.length, [rows]);

  const handleApply = (filtered: Home[], ring?: [number, number][]) => {
    setRows(filtered);
    setPolygon(ring);
    if (typeof window !== 'undefined') {
      if (ring && ring.length >= 3) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ring));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  };

  const handleReset = () => {
    setRows(ALL);
    setPolygon(undefined);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ marginBottom: 12, fontSize: 32, fontWeight: 700 }}>
        Expert Frontend Interview Task
      </h1>

      <MapPreview polygon={polygon} onClick={() => setOpen(true)} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: '#4b5563' }}>
          {polygon ? 'Map filter active' : 'No map filter'}
        </span>
        {polygon && (
          <button
            onClick={handleReset}
            style={{ fontSize: 13, padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff' }}
          >
            Reset
          </button>
        )}
      </div>

      <div
        style={{
          height: '72vh',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        <HomeTable homes={rows} />
      </div>

      <div
        style={{
          padding: '12px 16px',
          border: '1px solid #e5e7eb',
          borderTop: 0,
          borderRadius: '0 0 8px 8px',
          background: '#f9fafb',
          fontSize: 14,
        }}
      >
        Showing {total.toLocaleString()} rows
      </div>

      <MapModal
        open={open}
        onClose={() => setOpen(false)}
        homes={ALL}
        onApply={handleApply}
        initialPolygon={polygon}
      />
    </div>
  );
}
