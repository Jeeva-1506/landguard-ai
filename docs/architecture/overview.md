# Architecture Overview - LandGuard AI

LandGuard AI is an enterprise predictive land acquisition delay and risk management system built for government infrastructure projects.

## Multi-Tier System Topology

```
┌─────────────────────────────────────────────────────────────┐
│                    React + TypeScript + Vite                │
│            Frontend Application & GIS Interactive Map       │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API / JWT
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Node.js / Express Server                   │
│         Modular Controllers, Services & Auth Middleware      │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐┌─────────────────────────────┐
│    MongoDB Atlas / Mongoose  ││    Python FastAPI ML Engine │
│ Users, Parcels, Projects,    ││   scikit-learn Predictor    │
│ Documents, Predictions       ││   & Document AI OCR / NLP   │
└──────────────────────────────┘└─────────────────────────────┘
```

## Key Layers

1. **Frontend Tier**: Built with React 19, TypeScript, Vite, Tailwind CSS, Recharts, and Leaflet GIS.
2. **Backend API Gateway**: Node.js Express server providing REST endpoints for Authentication, Projects, Land Records, Documents, Predictions, GIS, Alerts, Analytics, and PDF Reports.
3. **Database Layer**: MongoDB Atlas with indexed Mongoose schemas for high-performance spatial and field queries.
4. **Python ML Microservice**: FastAPI server executing scikit-learn Random Forest classifiers and regressors for delay days, probability, cost overrun, and legal risk forecasting.
5. **Document AI Pipeline**: Automated OCR, NLP field extractor, and DB discrepancy detector.
