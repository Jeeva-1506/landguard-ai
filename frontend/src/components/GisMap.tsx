import React, { useState, useMemo, useRef, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Project, LandParcel } from "../types";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { 
  Search, 
  Layers, 
  FileText, 
  Paintbrush, 
  Edit3, 
  Compass, 
  MapPin, 
  HelpCircle, 
  Menu, 
  Filter, 
  Settings,
  ChevronDown,
  ChevronUp,
  FolderOpen
} from "lucide-react";

// GIS Dashboard Interactive Map Component (Tamil Nadu & India Satellite view with dataset detail popups)
interface GISDashboardMapProps {
  projects: Project[];
  parcels: LandParcel[];
  onViewParcel?: (id: string) => void;
}

// Center coordinate for the project corridor in Tamil Nadu, India
const INDIA_MAP_CENTER: [number, number] = [11.9401, 79.4861];

export default function GISDashboardMap({ projects, parcels: propParcels, onViewParcel }: GISDashboardMapProps) {
  // Leaflet references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const featuresLayerGroupRef = useRef<L.FeatureGroup | null>(null);
  const gridsLayerGroupRef = useRef<L.FeatureGroup | null>(null);

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParcel, setSelectedParcel] = useState<any | null>(null);

  // Parcel status colors matching screenshot
  const STATUS_COLORS = {
    "CONTACTED": "#4ba3e3",   // Blue
    "DECLINED": "#d9383a",    // Red
    "NEGOTIATING": "#f3e13b", // Yellow
    "NOT CONTACTED": "#d5d5d5", // Grey
    "SIGNED": "#5dc62e"       // Green
  };

  // Convert Indian Prop Parcels to perfectly aligned adjacent rectangular parcel boundaries (grid layout)
  // running along a horizontal corridor path in Tamil Nadu
  const indiaParcels = useMemo(() => {
    const baseLat = 11.9401; // Center latitude
    const startLng = 79.4350; // Starting longitude
    const stepLng = 0.0065;   // Width of each field/parcel in degrees longitude
    const heightLat = 0.0042; // Height of each field in degrees latitude

    return propParcels.map((parcel, idx) => {
      // Place parcels alternately on the North (top) and South (bottom) sides of the corridor line
      const isNorthSide = idx % 2 === 0;
      const colIndex = Math.floor(idx / 2);
      const lngCenter = startLng + colIndex * stepLng;
      
      const latCenter = isNorthSide 
        ? baseLat + heightLat / 2 
        : baseLat - heightLat / 2;

      // Define rectangular coordinates for adjacent parcel fields
      const bounds: [number, number][] = [
        [latCenter - heightLat / 2, lngCenter - stepLng / 2],
        [latCenter - heightLat / 2, lngCenter + stepLng / 2],
        [latCenter + heightLat / 2, lngCenter + stepLng / 2],
        [latCenter + heightLat / 2, lngCenter - stepLng / 2]
      ];

      let statusKey: keyof typeof STATUS_COLORS = "NOT CONTACTED";
      const rawStage = (parcel.acquisitionStage || "").toUpperCase();
      if (rawStage === "POSSESSION" || rawStage === "COMPLETED") statusKey = "SIGNED";
      else if (rawStage === "NEGOTIATION" || rawStage === "COMPENSATION") statusKey = "NEGOTIATING";
      else if (rawStage === "PENDING") statusKey = "NOT CONTACTED";

      const surveyNo = parcel.surveyNumber || `${101 + idx}/${(idx % 4) + 1}`;
      const villageName = parcel.village || (idx % 2 === 0 ? "Sriperumbudur" : "Vikravandi");
      const talukName = parcel.taluk || (idx % 2 === 0 ? "Kanchipuram" : "Villupuram");

      return {
        ...parcel,
        id: parcel.id,
        surveyNumber: surveyNo,
        village: villageName,
        taluk: talukName,
        owner: (parcel as any).landownerName || (parcel as any).ownerName || `Landowner #${idx + 101}`,
        lat: latCenter,
        lng: lngCenter,
        status: statusKey,
        bounds,
        acreage: parcel.landArea || "14.5",
        compensation: parcel.compensationAmount || 380000
      };
    });
  }, [propParcels]);

  // Compute pie chart data
  const pieData = useMemo(() => {
    const counts = {
      SIGNED: 0,
      CONTACTED: 0,
      NEGOTIATING: 0,
      DECLINED: 0,
      "NOT CONTACTED": 0
    };

    indiaParcels.forEach((p: any) => {
      const statusKey = p.status;
      if (statusKey in counts) {
        counts[statusKey as keyof typeof counts]++;
      } else {
        counts["NOT CONTACTED"]++;
      }
    });

    return [
      { name: "SIGNED", value: counts.SIGNED, color: STATUS_COLORS.SIGNED },
      { name: "CONTACTED", value: counts.CONTACTED, color: STATUS_COLORS.CONTACTED },
      { name: "DECLINED", value: counts.DECLINED, color: STATUS_COLORS.DECLINED },
      { name: "NEGOTIATING", value: counts.NEGOTIATING, color: STATUS_COLORS.NEGOTIATING },
      { name: "NOT CONTACTED", value: counts["NOT CONTACTED"], color: STATUS_COLORS["NOT CONTACTED"] }
    ].filter(d => d.value > 0);
  }, [indiaParcels]);

  const totalParcelsCount = indiaParcels.length;

  // Handle initialization and layers of the Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Map Instance centered in Tamil Nadu, India
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(INDIA_MAP_CENTER, 14); // Zoom in closer to show parcel grids

    mapInstanceRef.current = map;

    // Satellite imagery base layer as default
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}").addTo(map);

    // Layer groups
    featuresLayerGroupRef.current = L.featureGroup().addTo(map);
    gridsLayerGroupRef.current = L.featureGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Redraw features on parcel selection changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !featuresLayerGroupRef.current || !gridsLayerGroupRef.current) return;

    // Clear previous shapes
    featuresLayerGroupRef.current.clearLayers();
    gridsLayerGroupRef.current.clearLayers();

    // Set map view centered on Villupuram corridor path
    map.setView([11.9401, 79.48], 14);

    // --- Draw Grid lines & Section Labels (PLSS style mapped over Villupuram, TN area) ---
    const gridSpacingLng = 0.015;
    const gridSpacingLat = 0.01;
    const startLat = 11.92;
    const endLat = 11.96;
    const startLng = 79.41;
    const endLng = 79.55;

    let sectionNum = 1;
    for (let lat = startLat; lat < endLat; lat += gridSpacingLat) {
      for (let lng = startLng; lng < endLng; lng += gridSpacingLng) {
        // Draw rectangle boundary for sections
        L.rectangle([[lat, lng], [lat + gridSpacingLat, lng + gridSpacingLng]], {
          color: "#ffffff",
          weight: 1.0,
          fill: false,
          opacity: 0.35
        }).addTo(gridsLayerGroupRef.current);

        // Add section number overlay label
        const labelHtml = `<div style="color: rgba(255,255,255,0.7); font-size: 14px; font-weight: bold; text-shadow: 1px 1px 2px black;">${String(sectionNum).padStart(2, '0')}</div>`;
        const customIcon = L.divIcon({
          html: labelHtml,
          className: "grid-number-icon",
          iconSize: [25, 25]
        });
        L.marker([lat + gridSpacingLat/2, lng + gridSpacingLng/2], { icon: customIcon }).addTo(gridsLayerGroupRef.current);
        sectionNum++;
      }
    }

    // Add Township/Zone label in Tamil Nadu area
    const townshipIcon = L.divIcon({
      html: `<div style="color: rgba(255,255,255,0.85); font-size: 11px; font-weight: bold; tracking-widest: 2px;">102N 13W</div>`,
      className: "township-label",
      iconSize: [100, 20]
    });
    L.marker([11.956, 79.48], { icon: townshipIcon }).addTo(gridsLayerGroupRef.current);

    // --- Draw Straight Horizontal Transmission Corridor Line ---
    const linePoints: [number, number][] = [
      [11.9401, 79.40],
      [11.9401, 79.56]
    ];

    // Draw 200FT Easement (Yellow outline)
    L.polyline(linePoints, {
      color: "#d0aa37",
      weight: 35,
      opacity: 0.25,
    }).addTo(featuresLayerGroupRef.current);

    L.polyline(linePoints, {
      color: "#d0aa37",
      weight: 35,
      fill: false,
      opacity: 0.6,
      dashArray: "5, 10"
    }).addTo(featuresLayerGroupRef.current);

    // Draw 100FT Easement (Green outline)
    L.polyline(linePoints, {
      color: "#4caf50",
      weight: 18,
      opacity: 0.25,
    }).addTo(featuresLayerGroupRef.current);

    L.polyline(linePoints, {
      color: "#4caf50",
      weight: 18,
      fill: false,
      opacity: 0.7,
      dashArray: "3, 6"
    }).addTo(featuresLayerGroupRef.current);

    // Draw central corridor line (Thick Black Line)
    L.polyline(linePoints, {
      color: "#000000",
      weight: 4.5,
      opacity: 0.95
    }).addTo(featuresLayerGroupRef.current);

    // --- Draw Colored Database Parcels as Adjacent Polygons ---
    indiaParcels.forEach((parcel) => {
      const fillColor = STATUS_COLORS[parcel.status as keyof typeof STATUS_COLORS] || "#d5d5d5";
      
      const poly = L.polygon(parcel.bounds, {
        color: "#ffffff",
        weight: 1.0,
        fillColor: fillColor,
        fillOpacity: 0.45,
        opacity: 0.5
      }).addTo(featuresLayerGroupRef.current);

      poly.on("click", () => {
        setSelectedParcel(parcel);
        map.setView([parcel.lat, parcel.lng], 15);
      });

      // Also add glowing Cluster Circle Pin Marker (matching uploaded screenshot style!)
      const isHighRisk = parcel.riskLevel === "High" || parcel.objectionFiled;
      const bgGradient = isHighRisk 
        ? "radial-gradient(circle, rgba(239,68,68,0.95) 0%, rgba(185,28,28,0.85) 100%)"
        : "radial-gradient(circle, rgba(37,99,235,0.95) 0%, rgba(29,78,216,0.85) 100%)";
      const shadowColor = isHighRisk ? "rgba(239,68,68,0.7)" : "rgba(37,99,235,0.7)";

      const markerHtml = `
        <div style="
          background: ${bgGradient};
          color: white;
          font-weight: 800;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 11px;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px ${shadowColor}, 0 4px 10px rgba(0,0,0,0.5);
          border: 2px solid rgba(255,255,255,0.95);
          cursor: pointer;
        ">
          ${String(parcel.ownersCount || 1).padStart(2, '0')}
        </div>
      `;

      const clusterMarkerIcon = L.divIcon({
        html: markerHtml,
        className: "cluster-pin-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const pinMarker = L.marker([parcel.lat, parcel.lng], { icon: clusterMarkerIcon }).addTo(featuresLayerGroupRef.current);
      
      pinMarker.on("click", () => {
        setSelectedParcel(parcel);
        map.setView([parcel.lat, parcel.lng], 15);
      });
    });

  }, [indiaParcels]);

  // Zoom controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleGoHome = () => {
    mapInstanceRef.current?.setView([11.9401, 79.48], 14);
  };

  // Perform search by Parcel ID, Survey Number, Owner, District, Village, or Taluk
  const filteredParcelsList = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return indiaParcels.filter((p: any) => 
      (p.id && p.id.toLowerCase().includes(query)) ||
      (p.surveyNumber && p.surveyNumber.toLowerCase().includes(query)) ||
      (p.owner && p.owner.toLowerCase().includes(query)) ||
      (p.district && p.district.toLowerCase().includes(query)) ||
      (p.village && p.village.toLowerCase().includes(query)) ||
      (p.taluk && p.taluk.toLowerCase().includes(query))
    );
  }, [searchQuery, indiaParcels]);

  // Handler to search and navigate to target parcel
  const handleSearchExecute = () => {
    if (!searchQuery.trim()) return;
    const match = filteredParcelsList[0] || indiaParcels.find((p: any) => 
      (p.surveyNumber && p.surveyNumber.toLowerCase() === searchQuery.toLowerCase().trim()) ||
      (p.id && p.id.toLowerCase() === searchQuery.toLowerCase().trim())
    );

    if (match) {
      setSelectedParcel(match);
      mapInstanceRef.current?.flyTo([match.lat, match.lng], 16, {
        duration: 1.5
      });
    }
  };

  return (
    <div className="flex flex-col h-[750px] w-full bg-[#050a14] text-white font-sans overflow-hidden border border-slate-700 shadow-2xl rounded-2xl relative select-none">
      
      {/* Top Map Control Bar */}
      <div className="h-14 bg-slate-900/90 backdrop-blur-md flex items-center justify-between px-5 border-b border-slate-800 shrink-0 z-[2000]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-blue-600 text-white px-2.5 py-1 rounded-lg font-black text-xs tracking-wider font-mono shadow-xs">
            <span>SLA</span>
            <span className="bg-white text-blue-900 px-1 rounded-xs text-[10px]">GIS MAP</span>
          </div>
          <div>
            <h1 className="text-xs md:text-sm font-extrabold uppercase tracking-wider text-white">
              Land Acquisition GIS Spatial Satellite Map
            </h1>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Click any marker or plot to inspect parcel dataset claims & compensation</p>
          </div>
        </div>

        {/* Top Header Filter Badges */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center shadow-sm">
            <input
              type="text"
              placeholder="Search Survey No (e.g. 101/1), Parcel ID, Owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearchExecute();
              }}
              className="bg-slate-800 text-white text-xs px-3 py-1.5 pl-8 rounded-l-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 placeholder-slate-400 font-medium"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-r-xl flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
              onClick={handleSearchExecute}
            >
              Go
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Body */}
      <div className="flex-1 relative bg-[#050a14]">
        
        {/* Floating Zoom & Layers Controls (Left side) */}
        <div className="absolute top-4 left-4 z-[1000] flex flex-col bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-1 divide-y divide-slate-100">
          <button 
            onClick={handleZoomIn} 
            className="p-2 hover:bg-slate-100 rounded-t-xl text-slate-800 font-black text-sm cursor-pointer flex items-center justify-center w-9 h-9"
            title="Zoom In"
          >
            +
          </button>
          <button 
            onClick={handleZoomOut} 
            className="p-2 hover:bg-slate-100 text-slate-800 font-black text-sm cursor-pointer flex items-center justify-center w-9 h-9"
            title="Zoom Out"
          >
            -
          </button>
          <button 
            onClick={handleGoHome}
            className="p-2 hover:bg-slate-100 rounded-b-xl text-slate-600 cursor-pointer flex items-center justify-center w-9 h-9"
            title="Default Extent (Tamil Nadu)"
          >
            🏠
          </button>
        </div>

        {/* Leaflet Canvas Container */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* LEFT FLOATING PLOT DETAIL CARD POPOVER */}
        {selectedParcel && (
          <div className="absolute top-4 left-16 z-[3000] w-80 sm:w-96 bg-white text-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200/80 animate-in slide-in-from-left-4 duration-300 max-h-[92%] overflow-y-auto">
            {/* Popover Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-blue-600 text-white font-mono font-bold text-xs px-2 py-0.5 rounded-md">
                    Survey No: {selectedParcel.surveyNumber || "124/2"}
                  </span>
                  <span className="bg-slate-100 text-slate-700 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md">
                    ID: {selectedParcel.id}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-1.5 font-heading">
                  <span>{Math.round((selectedParcel.landArea || 2.4) * 4840)} Sq Yards ({selectedParcel.landArea} Acres)</span>
                  <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedParcel.village || "Sriperumbudur"}, {selectedParcel.district} District ({selectedParcel.projectId})</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedParcel(null)}
                className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Owner & Legal Title */}
            <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Landowner Name</span>
              <span className="text-sm font-extrabold text-slate-900 block">{selectedParcel.owner || "Landowner"}</span>
              <span className="text-[11px] text-slate-500 font-medium">Owners Count: {selectedParcel.ownersCount || 1} Person(s)</span>
            </div>

            {/* Compensation & Valuation */}
            <div className="mt-3 pb-3 border-b border-slate-100">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-slate-900 font-mono">
                  ₹ {new Intl.NumberFormat('en-IN').format(selectedParcel.compensationAmount || 3600000)}
                </span>
                <span className="text-xs font-bold text-slate-500">Total Award</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  selectedParcel.objectionFiled ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {selectedParcel.objectionFiled ? "Objection Filed" : "Clean Revenue Title"}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {selectedParcel.landType || "Agricultural Land"}
                </span>
              </div>
            </div>

            {/* Aerial Satellite Photo Preview */}
            <div className="mt-4 relative rounded-2xl overflow-hidden bg-slate-900 h-40 border border-slate-200 shadow-inner group">
              <img 
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80" 
                alt="Parcel Satellite Preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                <span className="text-white text-xs font-bold font-mono">Survey No #{selectedParcel.surveyNumber || selectedParcel.id}</span>
                <span className="text-slate-300 text-[10px] font-medium">{selectedParcel.landArea} Acres • {selectedParcel.village || "Sriperumbudur"}</span>
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold rounded-md font-mono">
                Satellite Aerial View
              </div>
            </div>

            {/* Dataset Fields Grid */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Acquisition Stage</span>
                <span className="font-bold text-slate-900">{selectedParcel.acquisitionStage || "Negotiation"}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Delay Risk Level</span>
                <span className={`font-bold ${
                  selectedParcel.riskLevel === "High" ? "text-rose-600" : selectedParcel.riskLevel === "Medium" ? "text-amber-600" : "text-emerald-600"
                }`}>
                  {selectedParcel.riskLevel || "Low"} Risk
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Court Litigation</span>
                <span className="font-bold text-slate-900">{selectedParcel.courtCase ? "Active Case" : "None"}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Compensation Status</span>
                <span className="font-bold text-slate-900">{selectedParcel.compensationStatus || "Pending"}</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-5 space-y-2">
              <button
                onClick={() => {
                  if (onViewParcel) onViewParcel(selectedParcel.id);
                }}
                className="w-full py-3 bg-amber-400 hover:bg-amber-500 font-extrabold text-slate-950 text-xs rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer uppercase tracking-wider"
              >
                <span>Process Award & Disburse Payout</span>
              </button>
              <button
                onClick={() => {
                  if (onViewParcel) onViewParcel(selectedParcel.id);
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 font-bold text-white text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>View Full Survey Profile Ledger →</span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom Coordinates Bar */}
        <div className="absolute bottom-3 left-4 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] font-mono tracking-wider flex items-center gap-2 text-slate-300 select-none shadow-lg">
          <Compass className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>11.94010 N, 79.48610 E (Corridor GIS Satellite Grid)</span>
        </div>
      </div>
    </div>
  );
}
