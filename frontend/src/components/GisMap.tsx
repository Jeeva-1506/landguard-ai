import React, { useState, useMemo, useRef, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Project, LandParcel } from "../types";
import { uploadLandCSV } from "../api";
import { 
  Search, 
  Layers, 
  MapPin, 
  Crosshair, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Edit3, 
  ExternalLink, 
  Upload, 
  Download,
  FileSpreadsheet,
  Building2,
  AlertCircle,
  Filter,
  Route,
  Activity,
  Navigation
} from "lucide-react";

interface GISDashboardMapProps {
  projects: Project[];
  parcels: LandParcel[];
  onViewParcel?: (id: string) => void;
}

// Compute Polygon Centroid (Exact Lat/Lng Center of Polygon Boundary)
function getPolygonCentroid(polygon: [number, number][]): [number, number] {
  if (!polygon || polygon.length === 0) return [11.9390, 79.4840];
  let sumLat = 0;
  let sumLng = 0;
  polygon.forEach(([lat, lng]) => {
    sumLat += lat;
    sumLng += lng;
  });
  return [sumLat / polygon.length, sumLng / polygon.length];
}

// Calculate Risk Score & Risk Level based on parcel properties
export function calculateRiskScore(parcel: Partial<LandParcel>): { score: number; level: 'Low' | 'Medium' | 'High' } {
  let score = 20;

  if (parcel.riskScore !== undefined && parcel.riskScore !== null) {
    score = Number(parcel.riskScore);
  } else if (parcel.delayProbability !== undefined) {
    score = Number(parcel.delayProbability);
  } else {
    if (parcel.ownershipStatus === 'Disputed' || parcel.ownershipDispute) score += 25;
    if (parcel.documentsComplete === false) score += 15;
    if (parcel.objectionFiled) score += 15;
    if (parcel.courtCase) score += 20;
    if (parcel.surveyCompleted === false) score += 10;
    if (parcel.previousDelay) score += 10;
    if (parcel.compensationStatus === 'Disputed') score += 15;
    if (parcel.ownersCount && parcel.ownersCount > 4) score += 10;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let level: 'Low' | 'Medium' | 'High' = 'Low';
  if (score > 70) level = 'High';
  else if (score > 40) level = 'Medium';

  return { score, level };
}

// Tile layers definitions
const BASE_MAPS = {
  satellite: {
    name: "Satellite View",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri World Imagery"
  },
  street: {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors"
  },
  terrain: {
    name: "Terrain Topo",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri World Topo Map"
  }
};

// Acquisition Stages
const ACQUISITION_STAGES = [
  "All Stages",
  "Land Identification",
  "Survey & Verification",
  "Notification (Sec 11)",
  "Objection Hearing (Sec 15)",
  "Compensation Award",
  "Possession & Handover"
];

// District Corridors Quick Jump List
const DISTRICT_CORRIDORS = [
  { id: "all", name: "Overview (All Districts)", lat: 11.1271, lng: 78.6569, zoom: 7 },
  { id: "villupuram", name: "Villupuram (NH-45)", lat: 11.9383, lng: 79.4853, zoom: 16 },
  { id: "kanchipuram", name: "Kanchipuram (NH-48)", lat: 12.8342, lng: 79.7036, zoom: 16 },
  { id: "chengalpattu", name: "Chengalpattu (NH-32)", lat: 12.6939, lng: 79.9757, zoom: 16 },
  { id: "cuddalore", name: "Cuddalore (NH-81)", lat: 11.7480, lng: 79.5514, zoom: 16 },
  { id: "trichy", name: "Tiruchirappalli (NH-83)", lat: 10.8905, lng: 78.7347, zoom: 16 },
  { id: "salem", name: "Salem (NH-79)", lat: 11.6635, lng: 78.1448, zoom: 16 },
  { id: "madurai", name: "Madurai (NH-44)", lat: 9.9856, lng: 78.0988, zoom: 16 },
  { id: "coimbatore", name: "Coimbatore (NH-181)", lat: 11.2451, lng: 76.9558, zoom: 16 },
  { id: "vellore", name: "Vellore (NH-716)", lat: 12.9708, lng: 79.1366, zoom: 16 },
  { id: "thanjavur", name: "Thanjavur (NH-83)", lat: 10.7232, lng: 79.0571, zoom: 16 }
];

export default function GISDashboardMap({ projects, parcels: propParcels, onViewParcel }: GISDashboardMapProps) {
  // Leaflet refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polygonLayerGroupRef = useRef<L.FeatureGroup | null>(null);
  const corridorLayerGroupRef = useRef<L.FeatureGroup | null>(null);
  const labelLayerGroupRef = useRef<L.FeatureGroup | null>(null);
  const polygonMapRef = useRef<Map<string, L.Polygon>>(new Map());

  // States
  const [currentBaseMap, setCurrentBaseMap] = useState<'satellite' | 'street' | 'terrain'>('satellite');
  const [stageFilter, setStageFilter] = useState<string>("All Stages");
  const [activeCorridor, setActiveCorridor] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParcel, setSelectedParcel] = useState<any | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(16);
  const [userMarker, setUserMarker] = useState<L.Marker | null>(null);
  
  // CSV Modal State
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});

  // Process and compute exact centroid lat/lng for every parcel
  const enrichedParcels = useMemo(() => {
    return propParcels.map((parcel, idx) => {
      const polyCoords: [number, number][] = parcel.polygon && parcel.polygon.length >= 3 
        ? parcel.polygon 
        : [
            [11.937257 + idx * 0.001, 79.482648 + idx * 0.001],
            [11.937279 + idx * 0.001, 79.483575 + idx * 0.001],
            [11.938165 + idx * 0.001, 79.483507 + idx * 0.001],
            [11.938098 + idx * 0.001, 79.48267 + idx * 0.001]
          ];

      // Exact Centroid calculation
      const [centroidLat, centroidLng] = getPolygonCentroid(polyCoords);

      const surveyNo = parcel.surveyNumber || `124/${idx + 1}`;
      const owner = parcel.ownerName || (parcel as any).landownerName || (parcel as any).owner || `Landowner #${101 + idx}`;
      const areaVal = parcel.area || parcel.landArea || 2.45;
      const areaUnitVal = parcel.areaUnit || "Acres";
      const locVal = parcel.location || parcel.village || parcel.district || "Villupuram, Tamil Nadu";
      const ownStatus = parcel.ownershipStatus || (parcel.ownershipDispute ? "Disputed" : "Verified");
      const acqStage = parcel.acquisitionStage || "Negotiation";

      const { score, level } = calculateRiskScore({
        ...parcel,
        ownershipStatus: ownStatus,
        riskScore: parcel.riskScore
      });

      return {
        ...parcel,
        id: parcel.id,
        surveyNumber: surveyNo,
        ownerName: owner,
        area: areaVal,
        areaUnit: areaUnitVal,
        latitude: centroidLat,
        longitude: centroidLng,
        polygon: polyCoords,
        riskScore: score,
        riskLevel: level,
        ownershipStatus: ownStatus,
        location: locVal,
        acquisitionStage: acqStage
      };
    });
  }, [propParcels]);

  // Filter parcels by Acquisition Stage
  const filteredParcels = useMemo(() => {
    if (stageFilter === "All Stages") return enrichedParcels;
    return enrichedParcels.filter(p => p.acquisitionStage === stageFilter);
  }, [enrichedParcels, stageFilter]);

  // Stats calculation
  const stats = useMemo(() => {
    let low = 0, medium = 0, high = 0;
    enrichedParcels.forEach((p) => {
      if (p.riskLevel === "High") high++;
      else if (p.riskLevel === "Medium") medium++;
      else low++;
    });
    return { total: enrichedParcels.length, low, medium, high };
  }, [enrichedParcels]);

  // Initialize Map Instance centered exactly at the main Villupuram acquisition corridor
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Villupuram Highway Acquisition Corridor Coordinates
    const mainCorridorCenter: [number, number] = [11.9400, 79.4850];

    const map = L.map(mapContainerRef.current, {
      center: mainCorridorCenter,
      zoom: 16,
      zoomControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Add Base Tile Layer
    const baseConfig = BASE_MAPS[currentBaseMap];
    tileLayerRef.current = L.tileLayer(baseConfig.url, {
      maxZoom: 19,
      attribution: baseConfig.attribution
    }).addTo(map);

    // Create Layer Groups
    corridorLayerGroupRef.current = L.featureGroup().addTo(map);
    polygonLayerGroupRef.current = L.featureGroup().addTo(map);
    labelLayerGroupRef.current = L.featureGroup().addTo(map);

    // Track zoom level
    const handleZoomEnd = () => {
      setCurrentZoom(map.getZoom());
    };
    map.on("zoomend", handleZoomEnd);

    return () => {
      map.off("zoomend", handleZoomEnd);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile Layer dynamically
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const baseConfig = BASE_MAPS[currentBaseMap];
    tileLayerRef.current = L.tileLayer(baseConfig.url, {
      maxZoom: 19,
      attribution: baseConfig.attribution
    }).addTo(map);
  }, [currentBaseMap]);

  // Draw Highway Corridor Alignment Polylines for each sector
  useEffect(() => {
    const corridorGroup = corridorLayerGroupRef.current;
    if (!corridorGroup || enrichedParcels.length === 0) return;

    corridorGroup.clearLayers();

    // Group parcels by District / Project to draw clean localized corridor polylines
    const groupsByDistrict = new Map<string, typeof enrichedParcels>();
    enrichedParcels.forEach(p => {
      const distKey = p.district || p.location.split(',')[1]?.trim() || "Villupuram";
      if (!groupsByDistrict.has(distKey)) groupsByDistrict.set(distKey, []);
      groupsByDistrict.get(distKey)!.push(p);
    });

    groupsByDistrict.forEach((districtParcels) => {
      if (districtParcels.length >= 2) {
        const sorted = districtParcels.slice().sort((a, b) => a.longitude - b.longitude);
        const points: [number, number][] = sorted.map(p => [p.latitude, p.longitude]);

        // Yellow Dashed Easement Buffer
        L.polyline(points, {
          color: "#f59e0b",
          weight: 16,
          opacity: 0.35,
          dashArray: "6, 12"
        }).addTo(corridorGroup);

        // Blue Corridor Centerline Alignment
        L.polyline(points, {
          color: "#2563eb",
          weight: 4,
          opacity: 0.95
        }).addTo(corridorGroup);
      }
    });
  }, [enrichedParcels]);

  // Render Exact Land Parcel Polygons & Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !polygonLayerGroupRef.current || !labelLayerGroupRef.current) return;

    polygonLayerGroupRef.current.clearLayers();
    labelLayerGroupRef.current.clearLayers();
    polygonMapRef.current.clear();

    if (filteredParcels.length === 0) return;

    filteredParcels.forEach((parcel) => {
      let fillColor = "#22c55e"; // Low Risk Green
      if (parcel.riskLevel === "High") fillColor = "#ef4444"; // High Risk Red
      else if (parcel.riskLevel === "Medium") fillColor = "#f59e0b"; // Medium Risk Yellow

      const isSelected = selectedParcel && selectedParcel.id === parcel.id;

      // Draw exact parcel polygon
      const polygon = L.polygon(parcel.polygon, {
        color: isSelected ? "#3b82f6" : "#ffffff",
        weight: isSelected ? 4 : 1.8,
        fillColor: fillColor,
        fillOpacity: isSelected ? 0.85 : 0.55,
        opacity: 0.95
      });

      polygonMapRef.current.set(parcel.id, polygon);

      // Tooltip on Hover
      polygon.bindTooltip(`
        <div style="font-family: sans-serif; font-weight: bold; font-size: 11px; padding: 2px 6px;">
          Survey No: ${parcel.surveyNumber} • ${parcel.location}
        </div>
      `, {
        sticky: true,
        direction: "top"
      });

      // Hover Styling
      polygon.on("mouseover", () => {
        if (selectedParcel?.id !== parcel.id) {
          polygon.setStyle({ weight: 3, fillOpacity: 0.8, color: "#ffffff" });
        }
      });

      polygon.on("mouseout", () => {
        if (selectedParcel?.id !== parcel.id) {
          polygon.setStyle({ weight: 1.8, fillOpacity: 0.55, color: "#ffffff" });
        }
      });

      // Click Event -> Fly directly to exact centroid location and open details
      polygon.on("click", () => {
        setSelectedParcel(parcel);

        map.flyTo([parcel.latitude, parcel.longitude], 17, {
          animate: true,
          duration: 1.2
        });

        polygonMapRef.current.forEach((poly, id) => {
          if (id === parcel.id) {
            poly.setStyle({ weight: 4, fillOpacity: 0.85, color: "#3b82f6" });
          } else {
            const p = enrichedParcels.find((item) => item.id === id);
            const pFill = p?.riskLevel === "High" ? "#ef4444" : p?.riskLevel === "Medium" ? "#f59e0b" : "#22c55e";
            poly.setStyle({ weight: 1.8, fillOpacity: 0.55, color: "#ffffff", fillColor: pFill });
          }
        });

        // Popup Content with exact Lat/Lng coordinates
        const popupContent = document.createElement("div");
        popupContent.className = "p-1 font-sans text-slate-800";
        popupContent.innerHTML = `
          <div style="min-width: 220px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
              <span style="font-weight: 800; font-size: 13px; color: #0f172a;">Survey No: ${parcel.surveyNumber}</span>
              <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; borderRadius: 4px; background: ${
                parcel.riskLevel === "High" ? "#fee2e2; color: #991b1b" : parcel.riskLevel === "Medium" ? "#fef3c7; color: #92400e" : "#dcfce7; color: #166534"
              };">
                ${parcel.riskLevel} Risk (${parcel.riskScore}%)
              </span>
            </div>
            <div style="font-size: 11px; margin-bottom: 3px;"><strong>Stage:</strong> <span style="color: #2563eb; font-weight: 700;">${parcel.acquisitionStage}</span></div>
            <div style="font-size: 11px; margin-bottom: 3px;"><strong>Owner:</strong> ${parcel.ownerName}</div>
            <div style="font-size: 11px; margin-bottom: 3px;"><strong>Area:</strong> ${parcel.area} ${parcel.areaUnit}</div>
            <div style="font-size: 11px; margin-bottom: 3px;"><strong>Location:</strong> ${parcel.location}</div>
            <div style="font-size: 10px; color: #2563eb; margin-top: 4px; font-family: monospace; font-weight: bold;">
              Exact Position: ${parcel.latitude.toFixed(6)}°N, ${parcel.longitude.toFixed(6)}°E
            </div>
            <button 
              id="popup-btn-${parcel.id}"
              style="margin-top: 8px; width: 100%; padding: 6px; background: #2563eb; color: white; border: none; border-radius: 6px; font-weight: 700; font-size: 11px; cursor: pointer;"
            >
              View Land Details
            </button>
          </div>
        `;

        const popup = L.popup({ closeButton: true })
          .setLatLng([parcel.latitude, parcel.longitude])
          .setContent(popupContent);

        polygon.bindPopup(popup).openPopup();

        setTimeout(() => {
          const btn = document.getElementById(`popup-btn-${parcel.id}`);
          if (btn) {
            btn.onclick = () => setSelectedParcel(parcel);
          }
        }, 100);
      });

      polygon.addTo(polygonLayerGroupRef.current);

      // Render Survey Number label at polygon centroid when zoom >= 14
      if (currentZoom >= 14) {
        const labelHtml = `
          <div style="
            color: #ffffff;
            font-size: 10px;
            font-weight: 800;
            font-family: sans-serif;
            text-shadow: 0 1px 3px rgba(0,0,0,0.9), 0 0 5px rgba(0,0,0,0.8);
            text-align: center;
            white-space: nowrap;
            pointer-events: none;
          ">
            ${parcel.surveyNumber}
          </div>
        `;
        const labelIcon = L.divIcon({
          html: labelHtml,
          className: "survey-num-label-icon",
          iconSize: [60, 16],
          iconAnchor: [30, 8]
        });
        L.marker([parcel.latitude, parcel.longitude], { icon: labelIcon, interactive: false }).addTo(labelLayerGroupRef.current);
      }
    });

  }, [filteredParcels, currentZoom]);

  // Handle Search Execution
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const query = searchQuery.toLowerCase().trim();

    const match = enrichedParcels.find((p) => 
      p.surveyNumber.toLowerCase().includes(query) ||
      p.ownerName.toLowerCase().includes(query) ||
      p.location.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query)
    );

    if (match && mapInstanceRef.current) {
      setSelectedParcel(match);
      mapInstanceRef.current.flyTo([match.latitude, match.longitude], 17, { duration: 1.2 });

      const poly = polygonMapRef.current.get(match.id);
      if (poly) {
        poly.fire("click");
      }
    }
  };

  // Jump to specific District / Corridor Sector
  const handleCorridorJump = (corridorId: string) => {
    setActiveCorridor(corridorId);
    const item = DISTRICT_CORRIDORS.find(c => c.id === corridorId);
    if (item && mapInstanceRef.current) {
      if (item.id === "all" && enrichedParcels.length > 0) {
        const bounds = L.latLngBounds([]);
        enrichedParcels.forEach(p => bounds.extend([p.latitude, p.longitude]));
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
        }
      } else {
        mapInstanceRef.current.flyTo([item.lat, item.lng], item.zoom, { duration: 1.2 });
      }
    }
  };

  // Zoom controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!isFullscreen) {
      if (mapContainerRef.current.requestFullscreen) {
        mapContainerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Geolocation ("Locate Me")
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coords: [number, number] = [latitude, longitude];

        const map = mapInstanceRef.current;
        if (map) {
          map.flyTo(coords, 17, { duration: 1.2 });

          if (userMarker) {
            map.removeLayer(userMarker);
          }

          const customUserIcon = L.divIcon({
            html: `
              <div style="
                width: 20px;
                height: 20px;
                background: #2563eb;
                border: 3px solid #ffffff;
                border-radius: 50%;
                box-shadow: 0 0 14px rgba(37,99,235,0.9), 0 0 0 8px rgba(37,99,235,0.25);
              "></div>
            `,
            className: "user-loc-marker",
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          const marker = L.marker(coords, { icon: customUserIcon })
            .addTo(map)
            .bindPopup("<b>My Current Location</b>")
            .openPopup();

          setUserMarker(marker);
        }
      },
      (err) => {
        console.error(err);
        alert("Unable to retrieve your location.");
      }
    );
  };

  // CSV Import Submission
  const handleCsvSubmit = async () => {
    if (!csvText.trim()) return;
    setIsUploading(true);
    setUploadMessage(null);
    try {
      const res = await uploadLandCSV(csvText);
      if (res.success) {
        setUploadMessage({
          text: `Successfully imported ${res.importedCount} land parcels!`,
          type: "success"
        });
        setTimeout(() => {
          setShowCsvModal(false);
          setCsvText("");
          setUploadMessage(null);
          window.location.reload();
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      setUploadMessage({
        text: err.message || "Failed to process CSV file.",
        type: "error"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Sample CSV Download
  const handleDownloadSampleCsv = () => {
    const sample = `surveyNumber,ownerName,area,areaUnit,latitude,longitude,polygon,ownershipStatus\n124/2,Ramesh Kumar,2.45,Acres,11.0168,76.9558,"11.0175,76.9545;11.0180,76.9560;11.0165,76.9570;11.0158,76.9552",Verified\n124/3,Sita Devi,1.80,Acres,11.0182,76.9580,"11.0190,76.9570;11.0195,76.9590;11.0175,76.9600;11.0170,76.9575",Under Verification\n125/1,K. Shanmugam,4.10,Acres,11.0140,76.9520,"11.0150,76.9510;11.0155,76.9535;11.0130,76.9540;11.0125,76.9515",Disputed`;
    const blob = new Blob([sample], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "land_parcels_sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Edit Save Handler
  const handleSaveEdit = () => {
    if (!selectedParcel) return;
    const updated = {
      ...selectedParcel,
      ...editFormData
    };
    setSelectedParcel(updated);
    setShowEditModal(false);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 4 DASHBOARD SUMMARY STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* TOTAL LAND PARCELS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Land Parcels</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">{stats.total}</h3>
            <span className="text-[11px] text-slate-500 font-medium">Mapped & Surveyed</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* LOW RISK */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Low Risk (0 - 40%)</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1 font-mono">{stats.low}</h3>
            <span className="text-[11px] text-emerald-600 font-semibold">Ready for Possession</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* MEDIUM RISK */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Medium Risk (41 - 70%)</p>
            <h3 className="text-2xl font-black text-amber-500 mt-1 font-mono">{stats.medium}</h3>
            <span className="text-[11px] text-amber-600 font-semibold">Under Verification</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* HIGH RISK */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">High Risk (71 - 100%)</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1 font-mono">{stats.high}</h3>
            <span className="text-[11px] text-rose-600 font-semibold">Requires Intervention</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* LOCATION & STAGE NAVIGATION BAR */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
        
        {/* District Corridor Jump Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 shrink-0">
            <Navigation className="w-4 h-4 text-blue-600" />
            <span>Exact Corridor Location:</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {DISTRICT_CORRIDORS.map((c) => (
              <button
                key={c.id}
                onClick={() => handleCorridorJump(c.id)}
                className={`px-3 py-1 text-xs font-extrabold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeCorridor === c.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Stage Filter Options */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 shrink-0">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Acquisition Stage:</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {ACQUISITION_STAGES.map((stage) => (
              <button
                key={stage}
                onClick={() => setStageFilter(stage)}
                className={`px-3 py-1 text-xs font-extrabold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  stageFilter === stage
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN GIS MAP CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative flex flex-col md:flex-row h-[780px]">
        
        {/* MAP CANVAS & OVERLAYS AREA */}
        <div className="flex-1 relative h-full flex flex-col">
          
          {/* TOP SEARCH BAR & CONTROLS HEADER */}
          <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
            
            {/* Search Input Box */}
            <div className="pointer-events-auto bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-slate-200 flex items-center gap-2 max-w-md w-full">
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="text"
                  placeholder="Search Survey No (e.g. 124/2), Owner, Village..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  className="w-full bg-slate-50 text-slate-900 text-xs font-semibold pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-slate-400"
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Search
              </button>
            </div>

            {/* Base Map Selector & CSV Upload Button */}
            <div className="pointer-events-auto flex items-center gap-2">
              <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-xl border border-slate-200 flex items-center divide-x divide-slate-100">
                <button
                  onClick={() => setCurrentBaseMap("satellite")}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                    currentBaseMap === "satellite" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Satellite
                </button>
                <button
                  onClick={() => setCurrentBaseMap("street")}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                    currentBaseMap === "street" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Street
                </button>
                <button
                  onClick={() => setCurrentBaseMap("terrain")}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                    currentBaseMap === "terrain" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Terrain
                </button>
              </div>

              <button
                onClick={() => setShowCsvModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-2xl shadow-xl border border-emerald-500 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import CSV</span>
              </button>
            </div>
          </div>

          {/* FLOATING MAP NAVIGATION CONTROLS */}
          <div className="absolute top-20 left-4 z-[1000] flex flex-col gap-1.5">
            <div className="bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200 p-1 flex flex-col divide-y divide-slate-100">
              <button
                onClick={handleZoomIn}
                className="p-2.5 hover:bg-slate-100 rounded-t-xl text-slate-800 font-black cursor-pointer flex items-center justify-center"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2.5 hover:bg-slate-100 text-slate-800 font-black cursor-pointer flex items-center justify-center"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleCorridorJump("villupuram")}
                className="p-2.5 hover:bg-slate-100 text-slate-700 font-black cursor-pointer flex items-center justify-center"
                title="Snap to Main Villupuram Acquisition Corridor"
              >
                <Route className="w-4 h-4 text-blue-600" />
              </button>
              <button
                onClick={handleLocateMe}
                className="p-2.5 hover:bg-slate-100 text-blue-600 font-black cursor-pointer flex items-center justify-center"
                title="Locate Me (Current Geolocation)"
              >
                <Crosshair className="w-4 h-4" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2.5 hover:bg-slate-100 rounded-b-xl text-slate-700 cursor-pointer flex items-center justify-center"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* RISK LEGEND */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-200 text-xs font-sans max-w-xs select-none space-y-2">
            <div className="flex items-center justify-between border-b pb-1.5">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Risk Level Legend</span>
              </h4>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-2xs"></span>
                  <span className="font-bold text-slate-700">Low Risk</span>
                </div>
                <span className="font-mono text-[11px] text-slate-500 font-semibold">0 - 40%</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-2xs"></span>
                  <span className="font-bold text-slate-700">Medium Risk</span>
                </div>
                <span className="font-mono text-[11px] text-slate-500 font-semibold">41 - 70%</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 border border-white shadow-2xs"></span>
                  <span className="font-bold text-slate-700">High Risk</span>
                </div>
                <span className="font-mono text-[11px] text-slate-500 font-semibold">71 - 100%</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-600 font-bold">
              <span className="w-4 h-1 bg-blue-600 rounded-full inline-block"></span>
              <span>Acquisition Alignment Line</span>
            </div>
          </div>

          {/* LEAFLET INTERACTIVE MAP CANVAS CONTAINER */}
          <div ref={mapContainerRef} className="w-full h-full bg-slate-900 z-0" />
        </div>

        {/* LAND DETAILS SIDEBAR */}
        {selectedParcel ? (
          <div className="w-full md:w-96 bg-white border-t md:border-t-0 md:border-l border-slate-200 p-6 flex flex-col justify-between overflow-y-auto shrink-0 z-20 shadow-2xl animate-in slide-in-from-right-4 duration-300">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">Land Acquisition Profile</span>
                  <h3 className="text-xl font-extrabold text-slate-900 font-heading">
                    Survey No: {selectedParcel.surveyNumber}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedParcel(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stage Badge */}
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">Acquisition Stage</span>
                  <span className="text-xs font-black text-blue-900">{selectedParcel.acquisitionStage}</span>
                </div>
                <Activity className="w-5 h-5 text-blue-600" />
              </div>

              {/* Risk Level Badge */}
              <div className={`mt-3 p-3 rounded-2xl border flex items-center justify-between ${
                selectedParcel.riskLevel === 'High' 
                  ? 'bg-rose-50 border-rose-200 text-rose-900' 
                  : selectedParcel.riskLevel === 'Medium' 
                  ? 'bg-amber-50 border-amber-200 text-amber-900' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Delay Risk Score</span>
                  <span className="text-lg font-black font-mono">{selectedParcel.riskScore}%</span>
                </div>
                <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                  selectedParcel.riskLevel === 'High' 
                    ? 'bg-rose-600 text-white' 
                    : selectedParcel.riskLevel === 'Medium' 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-emerald-600 text-white'
                }`}>
                  {selectedParcel.riskLevel} Risk
                </span>
              </div>

              {/* Attributes Grid */}
              <div className="mt-4 space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Owner Name</span>
                  <span className="text-sm font-extrabold text-slate-900 block">{selectedParcel.ownerName}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Land Area</span>
                    <span className="text-sm font-extrabold text-slate-900">{selectedParcel.area} {selectedParcel.areaUnit}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Ownership</span>
                    <span className="text-xs font-bold text-slate-900">{selectedParcel.ownershipStatus}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Location</span>
                  <span className="text-xs font-bold text-slate-900 block">{selectedParcel.location}</span>
                </div>

                <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 font-mono">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-0.5">Exact GIS Centroid</span>
                  <span className="text-xs font-bold text-slate-900 block">
                    Lat: {selectedParcel.latitude.toFixed(6)}° N
                  </span>
                  <span className="text-xs font-bold text-slate-900 block">
                    Lng: {selectedParcel.longitude.toFixed(6)}° E
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={() => {
                  if (onViewParcel) onViewParcel(selectedParcel.id);
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Full Details</span>
              </button>

              <button
                onClick={() => {
                  setEditFormData({ ...selectedParcel });
                  setShowEditModal(true);
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Land</span>
              </button>

              <button
                onClick={() => setSelectedParcel(null)}
                className="w-full py-2 text-slate-500 hover:text-slate-800 font-bold text-xs transition-all cursor-pointer"
              >
                Close Panel
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex w-72 bg-slate-50 border-l border-slate-200 p-6 flex-col items-center justify-center text-center shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-white text-slate-400 border border-slate-200 flex items-center justify-center mb-3">
              <MapPin className="w-6 h-6 text-slate-400" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm">Select a Land Parcel</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs font-medium">
              Click any land parcel on the map or use the location selector above to snap directly to the exact parcel location.
            </p>
          </div>
        )}
      </div>

      {/* CSV IMPORT MODAL */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Import Land Parcels (CSV)</h3>
              </div>
              <button
                onClick={() => setShowCsvModal(false)}
                className="p-1 text-slate-400 hover:text-slate-900 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Upload CSV data containing survey details and polygon boundary coordinates.
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">CSV Data Format</span>
              <button
                onClick={handleDownloadSampleCsv}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample CSV</span>
              </button>
            </div>

            <textarea
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={`surveyNumber,ownerName,area,areaUnit,latitude,longitude,polygon,ownershipStatus\n124/2,Ramesh Kumar,2.45,Acres,11.0168,76.9558,"11.0175,76.9545;11.0180,76.9560;11.0165,76.9570;11.0158,76.9552",Verified`}
              className="w-full bg-slate-50 font-mono text-xs p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />

            {uploadMessage && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                uploadMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {uploadMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{uploadMessage.text}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowCsvModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCsvSubmit}
                disabled={isUploading || !csvText.trim()}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl disabled:opacity-50 transition-all cursor-pointer"
              >
                {isUploading ? "Importing..." : "Process & Import"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT LAND PARCEL MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">Edit Land Parcel #{editFormData.surveyNumber}</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 text-slate-400 hover:text-slate-900 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Owner Name</label>
                <input
                  type="text"
                  value={editFormData.ownerName || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, ownerName: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Land Area</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.area || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, area: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ownership Status</label>
                  <select
                    value={editFormData.ownershipStatus || "Verified"}
                    onChange={(e) => setEditFormData({ ...editFormData, ownershipStatus: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                  >
                    <option value="Verified">Verified</option>
                    <option value="Under Verification">Under Verification</option>
                    <option value="Disputed">Disputed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Acquisition Stage</label>
                <select
                  value={editFormData.acquisitionStage || "Survey & Verification"}
                  onChange={(e) => setEditFormData({ ...editFormData, acquisitionStage: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                >
                  {ACQUISITION_STAGES.filter(s => s !== "All Stages").map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Risk Score (0 - 100%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editFormData.riskScore || 20}
                  onChange={(e) => {
                    const score = parseInt(e.target.value, 10);
                    let level: 'Low' | 'Medium' | 'High' = 'Low';
                    if (score > 70) level = 'High';
                    else if (score > 40) level = 'Medium';
                    setEditFormData({ ...editFormData, riskScore: score, riskLevel: level });
                  }}
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
