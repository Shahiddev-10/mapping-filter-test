'use client';
import * as turf from '@turf/turf';
import { Home } from '@/types/home';

export function filterHomesByPolygon(homes: Home[], ring?: [number, number][]) {
  if (!ring || ring.length < 3) return homes;
  const isClosed =
    ring[0][0] === ring[ring.length - 1][0] &&
    ring[0][1] === ring[ring.length - 1][1];
  const closed = isClosed ? ring : [...ring, ring[0]];
  const polygon = turf.polygon([closed]);
  return homes.filter(h =>
    turf.booleanPointInPolygon(turf.point([h.lng, h.lat]), polygon)
  );
}
