import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Project } from '@/lib/externalDb';
import { supabase } from '@/integrations/supabase/client';

interface CommandCenterMapProps {
  projects: Project[];
}

const STATUS_COLORS: Record<string, string> = {
  'Completed': '#10B981',
  'In Progress': '#EAB308',
  'Planned': '#F87171',
};

const STATUS_LABELS: Record<string, string> = {
  'Completed': 'Tamamlandı',
  'In Progress': 'Devam Ediyor',
  'Planned': 'Planlandı',
};

const STATUS_GLOW: Record<string, string> = {
  'Completed': '0 0 8px rgba(16,185,129,0.5)',
  'In Progress': '0 0 8px rgba(234,179,8,0.4)',
  'Planned': '0 0 6px rgba(248,113,113,0.4)',
};

const DEFAULT_CENTER: [number, number] = [36.9200, 30.7000];

// Kepez/Antalya region bounds for locking viewport
const KEPEZ_BOUNDS: L.LatLngBoundsExpression = [
  [36.70, 30.40],  // SW — relaxed
  [37.15, 30.95],  // NE — relaxed
];

/** Calculate pin size based on zoom level */
const getPinSize = (zoom: number): { size: number; border: number; glow: boolean } => {
  if (zoom <= 11) return { size: 4, border: 0, glow: true };
  if (zoom <= 12) return { size: 6, border: 1, glow: true };
  if (zoom <= 13) return { size: 8, border: 1, glow: true };
  if (zoom <= 14) return { size: 10, border: 2, glow: true };
  return { size: 14, border: 2, glow: true };
};

const createPinIcon = (color: string, status: string, zoom: number) => {
  const { size, border, glow } = getPinSize(zoom);
  const shadow = glow ? STATUS_GLOW[status] || 'none' : 'none';
  const borderStyle = border > 0 ? `border:${border}px solid rgba(255,255,255,0.6);` : '';

  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      ${borderStyle}
      border-radius:50%;
      box-shadow:${shadow};
      transition:width 0.25s,height 0.25s;
    "></div>`,
    className: 'custom-pin-icon',
    iconSize: L.point(size, size),
    iconAnchor: L.point(size / 2, size / 2),
  });
};

export const CommandCenterMap = ({ projects }: CommandCenterMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<{ marker: L.Marker; color: string; status: string }[]>([]);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const thumbnailCache = useRef<Record<string, string | null>>({});
  const navigate = useNavigate();

  // Resize all pins when zoom changes
  const updatePinSizes = useCallback((zoom: number) => {
    markersRef.current.forEach(({ marker, color, status }) => {
      marker.setIcon(createPinIcon(color, status, zoom));
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: 12,
      minZoom: 9,
      maxZoom: 18,
      maxBounds: L.latLngBounds(KEPEZ_BOUNDS),
      maxBoundsViscosity: 1.0,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Load Kepez GeoJSON boundary
    fetch('/kepez-boundary.geojson')
      .then(r => r.json())
      .then(data => {
        L.geoJSON(data, {
          style: {
            color: '#EAB308',
            weight: 2,
            opacity: 0.6,
            fillColor: '#EAB308',
            fillOpacity: 0.03,
            dashArray: '6 3',
          },
        }).addTo(map);
      })
      .catch(() => {});

    // Dynamic pin scaling on zoom
    map.on('zoomend', () => {
      updatePinSizes(map.getZoom());
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [updatePinSizes]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Remove previous markers
    if (markerLayerRef.current) {
      map.removeLayer(markerLayerRef.current);
    }
    markersRef.current = [];

    const layerGroup = L.layerGroup();
    const currentZoom = map.getZoom();
    const validCoords: [number, number][] = [];

    projects.forEach((project) => {
      if (!project.latitude || !project.longitude) return;

      const lat = project.latitude;
      const lng = project.longitude;
      const color = STATUS_COLORS[project.status] || '#EAB308';

      const marker = L.marker([lat, lng], {
        icon: createPinIcon(color, project.status, currentZoom),
        pane: 'markerPane',
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

      // Build popup content
      const statusLabel = STATUS_LABELS[project.status] || project.status;
      const budgetStr = project.budget ? `₺${Number(project.budget).toLocaleString('tr-TR')}` : '—';
      const neighborhood = project.neighborhood || project.district || '';
      const thumbUrl = project.image_url || '';

      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div class="map-popup-card" style="width:240px;font-family:system-ui;overflow:hidden;border-radius:10px;">
          <div style="width:100%;height:100px;background:${color}20;overflow:hidden;position:relative;">
            ${thumbUrl ? `<img src="${thumbUrl}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'" />` : ''}
          </div>
          <div style="padding:10px 12px 8px;">
            <div style="font-weight:700;font-size:13px;color:#f2f2f2;line-height:1.3;margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${project.title}</div>
            ${neighborhood ? `<div style="font-size:11px;color:#a1a1aa;margin-bottom:6px;">📍 ${neighborhood}</div>` : ''}
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
              <span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:99px;background:${color}30;color:${color};">${statusLabel}</span>
              <span style="font-size:11px;color:#d4d4d8;font-weight:600;">${budgetStr}</span>
            </div>
            <button class="popup-detail-btn" style="
              width:100%;padding:7px 0;border:none;border-radius:6px;
              background:linear-gradient(135deg,${color},${color}cc);
              color:#fff;font-size:12px;font-weight:600;cursor:pointer;
              display:flex;align-items:center;justify-content:center;gap:4px;
              transition:opacity 0.2s;
            ">Detayları Gör →</button>
          </div>
        </div>
      `;

      const detailBtn = popupContent.querySelector('.popup-detail-btn');
      if (detailBtn) {
        detailBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          navigate(`/admin/project/${project.id}`);
        });
      }

      marker.bindPopup(popupContent, {
        className: 'map-project-popup',
        closeButton: false,
        maxWidth: 260,
        minWidth: 240,
        offset: [0, -8],
        autoPan: true,
        autoPanPadding: [40, 40],
      });

      layerGroup.addLayer(marker);
      markersRef.current.push({ marker, color, status: project.status });
      validCoords.push([lat, lng]);
    });

    layerGroup.addTo(map);
    markerLayerRef.current = layerGroup;

    // Fit to project data on load
    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords.map(c => L.latLng(c[0], c[1])));
      map.fitBounds(bounds.pad(0.15), { maxZoom: 13, padding: [50, 50] });
    }
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
        .custom-pin-icon { background: transparent !important; border: none !important; }
      `}</style>
    </div>
  );
};
