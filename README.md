# LandGuard AI – Predictive Land Acquisition Delay & Risk Management System

LandGuard AI is an enterprise-grade AI/ML and GIS-powered platform designed for state and central government infrastructure agencies to predict, monitor, and mitigate land acquisition delays, legal disputes, cost overruns, and documentation discrepancies.

---

## 🏛️ System Architecture

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Leaflet GIS + Recharts
- **Backend API**: Node.js + Express + TypeScript (Modular Layered Architecture)
- **Database**: MongoDB Atlas + Mongoose (with automated seed migration & safe fallbacks)
- **AI/ML Microservice**: Python 3.11 + FastAPI + scikit-learn (Random Forest Regressor & Classifier)
- **Document AI**: Automated OCR, NLP field extraction, and DB discrepancy analyzer
- **Security**: JWT Authentication, bcrypt password hashing, and Role-Based Access Control (RBAC)
- **Reports**: Automated PDF report generation service using `pdfkit`

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+
- **Python**: v3.10+ (for Python ML service)
- **MongoDB Atlas** or Local MongoDB (optional, falls back gracefully to local JSON store if unconfigured)

### 2. Environment Configuration
Copy `.env.example` to `.env` and set your credentials:
```env
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/landguard
JWT_SECRET=landguard_secret_jwt_key_2026
PYTHON_ML_SERVICE_URL=http://localhost:8000
GEMINI_API_KEY=your_gemini_key_here
```

### 3. Run Development Server (Backend + Frontend)
```bash
npm install
npm run dev
```
The application will start on **[http://localhost:3000](http://localhost:3000)**.

### 4. Run Python ML Service (Optional)
```bash
cd ml-service
pip install -r requirements.txt
python main.py
```
The ML API service will start on **[http://localhost:8000](http://localhost:8000)**.

### 5. Run MongoDB Database Migration
```bash
npx tsx database/migrations/migrateSeed.ts
```

---

## 📡 Key REST API Endpoints

| Category | Endpoint | Description |
| :--- | :--- | :--- |
| **Auth** | `POST /api/auth/login` | Login and receive JWT token |
| **Auth** | `POST /api/auth/register` | Register new administrative user |
| **Projects** | `GET /api/projects` | List all land acquisition projects |
| **Land Records** | `GET /api/lands` | Filterable land records and survey search |
| **Land Records** | `GET /api/lands/survey/:surveyNumber` | Search parcel by survey number |
| **Document AI** | `POST /api/documents/upload` | Upload text, extract fields, and detect DB discrepancies |
| **Predictions** | `POST /api/predictions/delay` | Predict delay probability, days, and risk factors |
| **Predictions** | `POST /api/predictions/cost` | Forecast cost overrun exposure |
| **GIS** | `GET /api/gis/lands` | GeoJSON boundary polygons & risk levels |
| **Analytics** | `GET /api/analytics/dashboard` | Real-time aggregate statistics for dashboard |
| **Reports** | `GET /api/reports/project/:id` | Download generated PDF project report |
| **Reports** | `GET /api/reports/land/:id` | Download generated PDF land dossier |
| **AI Chatbot** | `POST /api/chat` | Database-aware AI assistant (`FACT`, `PREDICTION`, `RECOMMENDATION`) |

---

## 🧪 Verification & Build Commands

```bash
# Run TypeScript compilation check
npm run lint

# Build production bundle (Vite + esbuild)
npm run build
```

---

## 📄 License & Disclaimer
This system is an AI decision-support prototype built for government infrastructure planning. Synthetically generated cadastral boundary polygons are clearly demarcated for demonstration purposes.
