declare module '@changey/react-leaflet-markercluster' {
  import type { PropsWithChildren } from 'react';
  type MarkerClusterGroupOptions = Record<string, unknown>;

  const MarkerClusterGroup: (props: PropsWithChildren<MarkerClusterGroupOptions & {
    chunkedLoading?: boolean;
  }>) => JSX.Element;

  export default MarkerClusterGroup;
}
