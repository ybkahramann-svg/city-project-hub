import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
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

const getCoords = (project: Project): [number, number] => {
  if (project.latitude && project.longitude) {
    return [project.latitude, project.longitude];
  }
  return DEFAULT_CENTER;
};

const getDominantStatus = (markers: L.Marker[]): string => {
  const counts: Record<string, number> = {};
  markers.forEach(m => {
    const status = (m.options as any).statusType || 'In Progress';
    counts[status] = (counts[status] || 0) + 1;
  });
  let dominant = 'In Progress';
  let max = 0;
  for (const [status, count] of Object.entries(counts)) {
    if (count > max) { max = count; dominant = status; }
  }
  return dominant;
};

const createClusterIcon = (cluster: any) => {
  const childMarkers = cluster.getAllChildMarkers();
  const count = cluster.getChildCount();
  const dominant = getDominantStatus(childMarkers);
  const color = STATUS_COLORS[dominant] || '#EAB308';

  const size = count < 10 ? 36 : count < 50 ? 44 : 52;

  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      display:flex;align-items:center;justify-content:center;
      background:${color}22;
      border:2px solid ${color};
      border-radius:50%;
      color:${color};
      font-weight:700;
      font-size:${count < 10 ? 13 : 12}px;
      font-family:system-ui,sans-serif;
      box-shadow:0 0 12px ${color}44, inset 0 0 8px ${color}11;
      backdrop-filter:blur(4px);
      cursor:pointer;
      transition:transform 0.2s;
    ">${count}</div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(size, size),
  });
};

export const CommandCenterMap = ({ projects }: CommandCenterMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: 12,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Load real Kepez GeoJSON boundary and fit map to it
    fetch('/kepez-boundary.geojson')
      .then(r => r.json())
      .then(data => {
        const boundaryLayer = L.geoJSON(data, {
          style: {
            color: '#EAB308',
            weight: 2,
            opacity: 0.6,
            fillColor: '#EAB308',
            fillOpacity: 0.03,
            dashArray: '6 3',
          },
        }).addTo(map);
        // Center map on the real boundary
        map.fitBounds(boundaryLayer.getBounds().pad(0.05), { maxZoom: 13 });
      })
      .catch(() => {});

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Remove previous cluster group
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
    }

    const clusterGroup = (L as any).markerClusterGroup({
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: createClusterIcon,
      animate: true,
      disableClusteringAtZoom: 16,
      removeOutsideVisibleBounds: false,
    });

    projects.forEach((project) => {
      // Only render markers for projects with real coordinates
      if (!project.latitude || !project.longitude) return;

      const [lat, lng] = getCoords(project);
      const color = STATUS_COLORS[project.status] || '#EAB308';

      const icon = L.divIcon({
        html: `<div style="
          width:12px;height:12px;
          background:${color};
          border:2px solid rgba(255,255,255,0.6);
          border-radius:50%;
          box-shadow:${STATUS_GLOW[project.status] || 'none'};
        "></div>`,
        className: 'custom-pin-icon',
        iconSize: L.point(12, 12),
        iconAnchor: L.point(6, 6),
      });

      const marker = L.marker([lat, lng], {
        icon,
        statusType: project.status,
      } as any);

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
      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;

    // Boundary fitBounds handles viewport — no marker-based fitBounds needed
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
        .custom-cluster-icon { background: transparent !important; border: none !important; }
        .custom-pin-icon { background: transparent !important; border: none !important; }
        .marker-cluster-anim .custom-cluster-icon div {
          transition: transform 0.3s ease;
        }
      `}</style>
    </div>
  );
};
