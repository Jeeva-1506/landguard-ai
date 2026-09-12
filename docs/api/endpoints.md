# API Endpoints Documentation - LandGuard AI

## Base URL
`/api`

## Authentication API (`/api/auth`)
- `POST /api/auth/register` - Register new officer/user.
- `POST /api/auth/login` - Authenticate user and receive JWT.
- `GET /api/auth/me` - Get current authenticated user profile.

## Projects API (`/api/projects`)
- `GET /api/projects` - List all infrastructure projects.
- `GET /api/projects/:id` - Get project details with associated land parcels.
- `POST /api/projects` - Create new project record (Admin/Officer).
- `PUT /api/projects/:id` - Update project details.
- `DELETE /api/projects/:id` - Remove project record.

## Land Records API (`/api/lands`)
- `GET /api/lands` - Filterable land records (search, district, riskLevel, surveyNumber).
- `GET /api/lands/survey/:surveyNumber` - Search land parcel by exact survey number.
- `GET /api/lands/:id` - Get land parcel details by ID.
- `POST /api/lands` - Add new land parcel.
- `PUT /api/lands/:id` - Update land parcel details.
- `DELETE /api/lands/:id` - Delete land parcel.

## Document AI & Verification API (`/api/documents`)
- `GET /api/documents` - Fetch analyzed document records.
- `POST /api/documents/upload` - Upload OCR text, extract fields, and trigger DB discrepancy detection.
- `POST /api/documents/:id/verify` - Update document verification status.

## AI Prediction API (`/api/predictions`)
- `POST /api/predictions/delay` - Calculate predicted delay probability and days.
- `POST /api/predictions/cost` - Forecast cost overrun percentage and expected additional cost.
- `POST /api/predictions/legal` - Assess legal risk score and recommended legal actions.
- `GET /api/predictions/land/:landId` - Fetch prediction history for land parcel.

## GIS API (`/api/gis`)
- `GET /api/gis/lands` - Serve spatial GeoJSON FeatureCollection of land boundaries.
- `GET /api/gis/projects` - Serve project alignment spatial data.
- `GET /api/gis/land/:id` - Get parcel polygon and coordinates.

## PDF Reports API (`/api/reports`)
- `GET /api/reports/project/:id` - Download generated PDF project report.
- `GET /api/reports/land/:id` - Download generated PDF land parcel dossier.
