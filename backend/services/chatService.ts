import { LandParcel, Project, Alert } from "../types";

export interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  timestamp?: string;
  type?: "text" | "land_card" | "project_card" | "parcel_list" | "stage_info" | "error";
  data?: any;
  actions?: ChatAction[];
}

export interface ChatAction {
  label: string;
  type: "OPEN_GIS" | "SEARCH_SURVEY" | "OPEN_PROJECT" | "SHOW_HIGH_RISK" | "SHOW_PENDING_LAND" | "SHOW_COMPENSATION" | "SHOW_STAGE" | "FILTER_PROJECTS";
  surveyNumber?: string;
  projectId?: string;
  district?: string;
  stage?: string;
}

export interface ChatRequestPayload {
  message: string;
  projectId?: string | null;
  userId?: string;
  userRole?: string;
  language?: "en" | "ta";
}

// Official 8 Acquisition Stages Reference
const ACQUISITION_STAGES_INFO: Record<number, { name: string; desc: string; next: string }> = {
  1: {
    name: "Stage 1 – Land Identification",
    desc: "Initial identification of land parcels, corridor alignment alignment check, and preliminary survey mapping under Section 3A / RFCTLARR Act.",
    next: "Stage 2 – Survey & Verification"
  },
  2: {
    name: "Stage 2 – Survey & Verification",
    desc: "Physical ground boundary verification, GIS polygon mapping, landowner record check, and joint verification by Revenue & Highway authorities.",
    next: "Stage 3 – Notification"
  },
  3: {
    name: "Stage 3 – Notification",
    desc: "Official Gazette publication of Land Acquisition Notification (Sec 11 / Sec 3A). Notice issued to affected landowners for hearing.",
    next: "Stage 4 – Objection"
  },
  4: {
    name: "Stage 4 – Objection",
    desc: "Objection hearing phase (Sec 15 / Sec 3C). Landowners submit claims regarding land valuation, title disputes, or alignment revisions.",
    next: "Stage 5 – Compensation Assessment"
  },
  5: {
    name: "Stage 5 – Compensation Assessment",
    desc: "Valuation of land, structures, trees, and crops by the Competent Authority. Solatium (100%) and multiplier factor added to market value.",
    next: "Stage 6 – Award"
  },
  6: {
    name: "Stage 6 – Award",
    desc: "Declaration of final Land Acquisition Award (Sec 23 / Sec 3G). Final compensation amount determined and published.",
    next: "Stage 7 – Payment"
  },
  7: {
    name: "Stage 7 – Payment",
    desc: "Disbursement of compensation funds directly to verified landowner bank accounts via direct benefit transfer or court deposit.",
    next: "Stage 8 – Possession"
  },
  8: {
    name: "Stage 8 – Possession",
    desc: "Final legal physical possession and handover of acquired land corridor to the project executing agency for construction.",
    next: "Project Execution & Civil Works"
  }
};

export function processChatMessage(
  payload: ChatRequestPayload,
  db: { projects: Project[]; parcels: LandParcel[]; alerts: Alert[] }
): ChatMessage {
  const rawMsg = payload.message || "";
  const query = rawMsg.trim().toLowerCase();
  const lang = payload.language || (isTamilOrTanglish(rawMsg) ? "ta" : "en");
  const role = payload.userRole || "Administrator";

  // 1. Detect Survey Number query (e.g., 124/2, 125/3, 126/4, LA1024, survey 124/2)
  const surveyMatch = rawMsg.match(/(?:survey|sn|s\.n|no\.?|parcel)?\s*#?\s*([0-9]{3}\/[0-9]{1,2}|la[0-9]{4})/i);
  if (surveyMatch) {
    const matchedNo = surveyMatch[1].toUpperCase();
    const parcel = db.parcels.find(
      (p) =>
        (p.surveyNumber && p.surveyNumber.toUpperCase() === matchedNo) ||
        (p.id && p.id.toUpperCase() === matchedNo)
    );

    if (parcel) {
      const isTa = lang === "ta";
      const replyText = isTa
        ? `Survey No. ${parcel.surveyNumber} விவரங்கள்:\n📍 கிராமம்/மாவட்டம்: ${parcel.location}\n📐 நிலப்பரப்பு: ${parcel.area || parcel.landArea} ${parcel.areaUnit || "Acres"}\n👤 உரிமையாளர்: ${parcel.ownerName}\n📑 நிலை: ${parcel.acquisitionStage}\n⚠️ தாமத அபாயம்: ${parcel.riskLevel} Risk (${parcel.riskScore}%)\n💰 இழப்பீடு நிலை: ${parcel.compensationStatus}`
        : `Survey No. ${parcel.surveyNumber} is currently under ${parcel.acquisitionStage}.\n\nLocation: ${parcel.location}\nOwner: ${parcel.ownerName}\nLand Area: ${parcel.area || parcel.landArea} ${parcel.areaUnit || "Acres"}\nDelay Risk: ${parcel.riskLevel} (${parcel.riskScore}%)\nCompensation: ${parcel.compensationStatus}`;

      return {
        sender: "ai",
        text: replyText,
        type: "land_card",
        data: {
          surveyNumber: parcel.surveyNumber,
          parcelId: parcel.id,
          ownerName: parcel.ownerName,
          location: parcel.location,
          area: `${parcel.area || parcel.landArea} ${parcel.areaUnit || "Acres"}`,
          stage: parcel.acquisitionStage,
          riskLevel: parcel.riskLevel,
          riskScore: parcel.riskScore,
          compensationStatus: parcel.compensationStatus,
          compensationAmount: parcel.compensationAmount ? `₹${(parcel.compensationAmount / 100000).toFixed(2)} Lakhs` : "Pending Valuation",
          latitude: parcel.latitude,
          longitude: parcel.longitude
        },
        actions: [
          {
            label: "🗺️ Open GIS Map & Focus Parcel",
            type: "OPEN_GIS",
            surveyNumber: parcel.surveyNumber
          }
        ]
      };
    } else {
      return {
        sender: "ai",
        text: lang === "ta"
          ? `மன்னித்துக்கொள்ளவும், Survey No. ${matchedNo} LandGuard பதிவேடுகளில் கிடைக்கவில்லை.`
          : `I couldn't find Survey No. ${matchedNo} in the official LandGuard acquisition records.`
      };
    }
  }

  // 2. GIS / Map Commands (e.g., "show survey 124/2 on map", "open map", "gis map")
  if (query.includes("map") || query.includes("gis") || query.includes("location") || query.includes("show on map")) {
    return {
      sender: "ai",
      text: lang === "ta"
        ? "நிலங்கள் மற்றும் சர்வே எண்களைக் காண GIS Interactive வரைபடத்தைத் திறக்கிறேன்."
        : "Opening the GIS Interactive Risk Map to view spatial land parcel boundaries.",
      actions: [
        {
          label: "🗺️ View Interactive GIS Map",
          type: "OPEN_GIS"
        }
      ]
    };
  }

  // 3. High Risk Lands Query (e.g., "show high risk lands", "which parcels have high risk", "high risk lands in villupuram")
  if (query.includes("high risk") || query.includes("risk") || query.includes("danger") || query.includes("critical")) {
    const highRiskList = db.parcels.filter((p) => p.riskLevel === "High" || (p.riskScore && p.riskScore > 70));
    
    // Check if district is specified
    const matchedDistrict = db.parcels.find((p) => p.district && query.includes(p.district.toLowerCase()))?.district;
    const filteredList = matchedDistrict
      ? highRiskList.filter((p) => p.district.toLowerCase() === matchedDistrict.toLowerCase())
      : highRiskList;

    const count = filteredList.length;
    const textHeader = matchedDistrict
      ? (lang === "ta" ? `${matchedDistrict} மாவட்டத்தில் ${count} அதிக அபாயம் உள்ள நிலப்பகுதிகள் கண்டறியப்பட்டுள்ளன.` : `Found ${count} High-Risk land parcels in ${matchedDistrict} district.`)
      : (lang === "ta" ? `மொத்தம் ${count} அதிக அபாயம் உள்ள நிலப்பகுதிகள் கண்டறியப்பட்டுள்ளன.` : `Found ${count} High-Risk land parcels across all project corridors.`);

    return {
      sender: "ai",
      text: textHeader,
      type: "parcel_list",
      data: filteredList.slice(0, 5).map((p) => ({
        surveyNumber: p.surveyNumber,
        location: p.location,
        ownerName: p.ownerName,
        riskScore: p.riskScore,
        stage: p.acquisitionStage
      })),
      actions: [
        {
          label: "🗺️ View High-Risk Lands on GIS Map",
          type: "SHOW_HIGH_RISK",
          district: matchedDistrict
        }
      ]
    };
  }

  // 4. Pending Land Hectares Query (e.g. "evlo land pending iruku", "how much land is pending", "pending land")
  if (query.includes("pending land") || query.includes("land pending") || query.includes("acquired land") || (query.includes("pending") && query.includes("land"))) {
    let totalReq = 0;
    let totalAcq = 0;
    db.projects.forEach((p) => {
      totalReq += p.landRequired || 0;
      totalAcq += p.landAcquired || 0;
    });
    const totalPending = Math.max(0, totalReq - totalAcq);
    const overallProgress = totalReq > 0 ? ((totalAcq / totalReq) * 100).toFixed(1) : "0";

    const reply = lang === "ta"
      ? `நிலக் கையகப்படுத்துதல் நிலவரம்:\n• மொத்த தேவைப்படும் நிலம்: ${totalReq.toFixed(1)} Hectares\n• கையகப்படுத்தப்பட்ட நிலம்: ${totalAcq.toFixed(1)} Hectares (${overallProgress}%)\n• நிலுவையில் உள்ள நிலம்: ${totalPending.toFixed(1)} Hectares`
      : `Overall Land Acquisition Status:\n\n• Total Land Required: ${totalReq.toFixed(1)} Hectares\n• Total Land Acquired: ${totalAcq.toFixed(1)} Hectares (${overallProgress}%)\n• Remaining Pending Land: ${totalPending.toFixed(1)} Hectares`;

    return {
      sender: "ai",
      text: reply,
      actions: [
        {
          label: "📊 View All Registered Projects",
          type: "FILTER_PROJECTS"
        }
      ]
    };
  }

  // 5. Compensation Status Query (e.g. "compensation status", "how much compensation is pending")
  if (query.includes("compensation") || query.includes("payment") || query.includes("award") || query.includes("solatium")) {
    let totalComp = 0;
    let pendingCount = 0;
    let paidCount = 0;

    db.parcels.forEach((p) => {
      if (p.compensationAmount) totalComp += p.compensationAmount;
      if (p.compensationStatus === "Paid") paidCount++;
      else pendingCount++;
    });

    const reply = lang === "ta"
      ? `இழப்பீடு வழங்கல் நிலை:\n• மதிப்பிடப்பட்ட மொத்த இழப்பீடு தொகை: ₹${(totalComp / 10000000).toFixed(2)} Cr\n• இழப்பீடு நிலுவையில் உள்ள சர்வே எண்கள்: ${pendingCount}\n• இழப்பீடு வழங்கப்பட்ட சர்வே எண்கள்: ${paidCount}`
      : `Compensation Disbursement Overview:\n\n• Total Assessed Compensation: ₹${(totalComp / 10000000).toFixed(2)} Cr\n• Pending Compensation Parcels: ${pendingCount}\n• Fully Disbursed Compensation Parcels: ${paidCount}`;

    return {
      sender: "ai",
      text: reply,
      actions: [
        {
          label: "💰 View Compensation Register",
          type: "SHOW_COMPENSATION"
        }
      ]
    };
  }

  // 6. Acquisition Stages Explanation (Stage 1 to Stage 8)
  const stageNumMatch = query.match(/stage\s*([1-8])/i);
  if (stageNumMatch || query.includes("stage") || query.includes("timeline") || query.includes("process")) {
    let stageNum = stageNumMatch ? parseInt(stageNumMatch[1], 10) : 3;
    
    if (query.includes("what happens after notification") || query.includes("after stage 3")) {
      stageNum = 4;
    } else if (query.includes("possession") || query.includes("stage 8")) {
      stageNum = 8;
    } else if (query.includes("identification") || query.includes("stage 1")) {
      stageNum = 1;
    }

    const info = ACQUISITION_STAGES_INFO[stageNum] || ACQUISITION_STAGES_INFO[3];

    const reply = lang === "ta"
      ? `${info.name}:\n${info.desc}\n\nஅடுத்த நிலை: ${info.next}`
      : `${info.name}:\n\n${info.desc}\n\nNext Progression Stage: ${info.next}`;

    return {
      sender: "ai",
      text: reply,
      type: "stage_info",
      data: {
        stageNumber: stageNum,
        stageName: info.name,
        description: info.desc,
        nextStage: info.next
      },
      actions: [
        {
          label: "📑 Track Acquisition Stages",
          type: "SHOW_STAGE",
          stage: info.name
        }
      ]
    };
  }

  // 7. Project Specific Queries (e.g. "Chennai project", "NH-101", "Coimbatore", "status of NH-45")
  const matchedProject = db.projects.find(
    (p) =>
      query.includes(p.id.toLowerCase()) ||
      query.includes(p.name.toLowerCase()) ||
      query.includes(p.district.toLowerCase())
  );

  if (matchedProject) {
    const isTa = lang === "ta";
    const req = matchedProject.landRequired || 100;
    const acq = matchedProject.landAcquired || 0;
    const pend = matchedProject.landPending !== undefined ? matchedProject.landPending : Math.max(0, req - acq);

    const reply = isTa
      ? `திட்டம்: ${matchedProject.name} (${matchedProject.id})\n📍 மாவட்டம்: ${matchedProject.district}\n📐 தேவைப்படும் நிலம்: ${req} Ha | கையகப்படுத்தப்பட்டது: ${acq} Ha | நிலுவை: ${pend} Ha\n📊 முன்னேற்றம்: ${matchedProject.progress}%\n📑 தற்போதைய நிலை: ${matchedProject.currentStage || "Notification"}\n⚠️ அபாய நிலை: ${matchedProject.delayRisk}`
      : `Project Profile: ${matchedProject.name} (${matchedProject.id})\n\nDistrict: ${matchedProject.district}\nRequired Land: ${req} Ha\nAcquired Land: ${acq} Ha\nPending Land: ${pend} Ha\nProgress: ${matchedProject.progress}%\nCurrent Stage: ${matchedProject.currentStage || "Notification"}\nDelay Risk: ${matchedProject.delayRisk}`;

    return {
      sender: "ai",
      text: reply,
      type: "project_card",
      data: {
        id: matchedProject.id,
        name: matchedProject.name,
        district: matchedProject.district,
        landRequired: req,
        landAcquired: acq,
        landPending: pend,
        progress: matchedProject.progress,
        delayRisk: matchedProject.delayRisk,
        currentStage: matchedProject.currentStage || "Notification"
      },
      actions: [
        {
          label: `📊 View Project ${matchedProject.id}`,
          type: "OPEN_PROJECT",
          projectId: matchedProject.id
        }
      ]
    };
  }

  // 8. Help / Default Welcome Guidance
  return {
    sender: "ai",
    text: lang === "ta"
      ? "வணக்கம்! 👋 நான் LandGuard AI உதவி மையம்.\n\nநான் உங்களுக்கு பின்வரும் தகவல்களில் உதவ முடியும்:\n• சர்வே எண்கள் (உதா: 124/2 status)\n• நில கையகப்படுத்துதல் திட்டங்கள் (உதா: NH-101)\n• 8-அடுக்கு நிலக் கையகப்படுத்துதல் நிலைகள்\n• இழப்பீடு நிலை மற்றும் நிலுவைகள்\n• GIS வரைபடக் கட்டுப்பாடுகள்"
      : "Vanakkam! 👋 I am the LandGuard AI Assistant.\n\nI can help you with:\n• Survey numbers (e.g. 'status of survey 124/2')\n• Land acquisition projects (e.g. 'NH-101 status')\n• 8-Stage acquisition timeline tracking\n• Compensation disbursement status\n• High-risk parcel identification & GIS mapping",
    actions: [
      { label: "🔍 Search Survey Number", type: "SEARCH_SURVEY" },
      { label: "⚠️ Check Delay Risk", type: "SHOW_HIGH_RISK" },
      { label: "🗺️ Open GIS Map", type: "OPEN_GIS" }
    ]
  };
}

function isTamilOrTanglish(text: string): boolean {
  const tamilRegex = /[\u0B80-\u0BFF]/;
  if (tamilRegex.test(text)) return true;
  const tanglishWords = ["enna", "iruku", "vanakkam", "ippa", "ya", "kattala", "evlo", "nila", "நிலம்", "சர்வே"];
  const lower = text.toLowerCase();
  return tanglishWords.some((w) => lower.includes(w));
}
