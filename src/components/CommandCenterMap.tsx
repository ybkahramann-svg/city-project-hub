import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Project } from '@/lib/externalDb';

interface CommandCenterMapProps {
  projects: Project[];
}

const STATUS_COLORS: Record<string, string> = {
  'Completed': '#10B981',
  'In Progress': '#EAB308',
  'Planned': '#F87171',
};

const STATUS_GLOW: Record<string, string> = {
  'Completed': '0 0 8px rgba(16,185,129,0.5)',
  'In Progress': '0 0 8px rgba(234,179,8,0.4)',
  'Planned': '0 0 6px rgba(248,113,113,0.4)',
};

const DEFAULT_CENTER: [number, number] = [36.9200, 30.7000];

// Approximate Kepez district boundary polygon
const KEPEZ_BOUNDARY: [number, number][] = [
  [36.975, 30.620],
  [36.980, 30.660],
  [36.975, 30.700],
  [36.965, 30.740],
  [36.950, 30.770],
  [36.930, 30.785],
  [36.905, 30.780],
  [36.885, 30.760],
  [36.870, 30.730],
  [36.865, 30.690],
  [36.870, 30.650],
  [36.885, 30.620],
  [36.905, 30.600],
  [36.930, 30.595],
  [36.950, 30.600],
  [36.975, 30.620],
];

const getCoords = (project: Project): [number, number] => {
  if (project.latitude && project.longitude) {
    return [project.latitude, project.longitude];
  }
  return DEFAULT_CENTER;
};

export const CommandCenterMap = ({ projects }: CommandCenterMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Kepez district boundary
    L.polygon(KEPEZ_BOUNDARY, {
      color: 'rgba(234,179,8,0.18)',
      weight: 1.5,
      fillColor: 'rgba(234,179,8,0.04)',
      fillOpacity: 1,
      dashArray: '6 4',
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) map.removeLayer(layer);
    });

    // Fit bounds to all project markers if available
    const validCoords = projects
      .filter(p => p.latitude && p.longitude)
      .map(p => [p.latitude!, p.longitude!] as [number, number]);

    if (validCoords.length > 1) {
      map.fitBounds(L.latLngBounds(validCoords).pad(0.15), { maxZoom: 14 });
    }

    projects.forEach((project) => {
      const [lat, lng] = getCoords(project);
      const color = STATUS_COLORS[project.status] || '#EAB308';
      const glow = STATUS_GLOW[project.status] || 'none';

      const marker = L.circleMarker([lat, lng], {
        radius: 5,
        fillColor: color,
        fillOpacity: 0.9,
        color: 'rgba(255,255,255,0.5)',
        weight: 1.5,
        opacity: 1,
      }).addTo(map);

      const progress = project.progress ?? 0;
      marker.bindTooltip(
        `<div style="font-family:system-ui;font-size:12px;line-height:1.4;">
          <strong>${project.title}</strong><br/>
          <span style="color:${color}">● ${project.status}</span>
          ${project.status === 'In Progress' ? `<br/>Progress: <strong>${progress}%</strong>` : ''}
        </div>`,
        { className: 'map-tooltip', direction: 'top', offset: [0, -8] }
      );

      marker.on('click', () => navigate(`/project/${project.id}`));
    });
  }, [projects, navigate]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-border/30">
      <div ref={mapRef} className="w-full h-full" />
      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-card/80 backdrop-blur-md rounded-lg p-2.5 border border-border/30">
        <div className="flex gap-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: STATUS_GLOW[status] }} />
              {status}
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .map-tooltip {
          background: hsl(220 20% 12% / 0.95) !important;
          border: 1px solid hsl(220 20% 20%) !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
          color: #f2f2f2 !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4) !important;
        }
        .map-tooltip::before { border-top-color: hsl(220 20% 12% / 0.95) !important; }
        .leaflet-control-zoom a {
          background: hsl(220 20% 12% / 0.9) !important;
          color: #f2f2f2 !important;
          border-color: hsl(220 20% 20%) !important;
        }
        .leaflet-control-zoom a:hover { background: hsl(220 20% 20%) !important; }
      `}</style>
    </div>
  );
};
