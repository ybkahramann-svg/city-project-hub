import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Project } from '@/lib/externalDb';

interface CommandCenterMapProps {
  projects: Project[];
}

const STATUS_COLORS: Record<string, string> = {
  'Completed': '#22c55e',
  'In Progress': '#eab308',
  'Planned': '#ef4444',
};

// Antalya districts with approximate coordinates for scattering
const DISTRICT_COORDS: Record<string, [number, number]> = {
  'Kepez': [36.9450, 30.6900],
  'Muratpaşa': [36.8850, 30.7050],
  'Konyaaltı': [36.8700, 30.6350],
  'Aksu': [36.9250, 30.8000],
  'Döşemealtı': [37.0100, 30.6000],
};

const DEFAULT_CENTER: [number, number] = [36.9200, 30.7000];

const getCoords = (project: Project, index: number): [number, number] => {
  const base = (project.district && DISTRICT_COORDS[project.district]) || DEFAULT_CENTER;
  // Scatter to prevent overlap
  const angle = (index * 137.508) * (Math.PI / 180);
  const radius = 0.005 + (index % 5) * 0.003;
  return [base[0] + Math.cos(angle) * radius, base[1] + Math.sin(angle) * radius];
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

    projects.forEach((project, i) => {
      const [lat, lng] = getCoords(project, i);
      const color = STATUS_COLORS[project.status] || '#eab308';

      const marker = L.circleMarker([lat, lng], {
        radius: 7,
        fillColor: color,
        fillOpacity: 0.85,
        color: color,
        weight: 2,
        opacity: 0.5,
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
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
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
