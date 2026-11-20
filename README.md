# BM360 — Bharat Mandapam Operations Portal

A comprehensive housekeeping and facility-operations portal for Bharat Mandapam, built with Next.js, TypeScript, and Tailwind CSS. Supports four portals — **Admin**, **ITPO**, **Agency**, and **individual ITPO officials** — plus a **public citizen complaint page** scannable via zone QR codes.

## Tech Stack

- **Framework**: Next.js 16.4.6 (App Router, Turbopack)
- **Language**: TypeScript 7.0.2
- **UI**: React 19.3.1 + Tailwind CSS 4.3.5
- **QR scanning**: `html5-qrcode`
- **QR generation**: `qrcode`
- **Persistence**: In-memory state + filesystem CSV (`/data/`, git-ignored) via API routes — ready to be swapped for a real database

## Portals & Routes

| Route | Portal | Access |
|---|---|---|
| `/` | Login (mobile + OTP `123456`) | Public |
| `/dashboard` | Admin dashboard | Admin |
| `/itpo-dashboard` | ITPO operations dashboard | ITPO |
| `/agency-dashboard` | Agency dashboard (manager / supervisor roles) | Agency |
| `/official-dashboard?id=X` | Individual ITPO official dashboard | Per-official |
| `/raise-complaint` | Public citizen complaint form | Citizens (no login) |
| `/qr-codes` | Printable zone QR generator | Public |

### API routes

- `POST/GET /api/attendance` — field-staff attendance records + camera photos → `data/attendance.csv`, `data/photos/`
- `POST/GET /api/complaints` — citizen complaint submissions → `data/complaints.csv`

## Features

### Authentication
- BM360-branded login with feature cards, decorative backgrounds, and bilingual (EN/हिंदी) toggle
- Two-step flow: mobile number → 6-digit OTP (static `123456` for demo)

### Admin Dashboard (`/dashboard`)
- **Overview** — complaint stats cards linked to filtered views
- **Complaint Register / All / Resolved / Pending Complaints** — searchable tables with status pills
- **Housekeeping Worker Ranking** & **ITPO Official Performance**
- **Zones & Areas** — full CRUD for all ~50 operational zones (search, add/edit modal, delete, area/manager/status)
- **Agencies** — CRUD + complete agency detail landing page:
  - Profile header, service pills, contact details, operational-zone chips
  - Stat cards (employees, active staff, zones, complaints handled)
  - Employee management: searchable table, CSV bulk import, manual entry, delete
- **ITPO Officials** — CRUD + per-official dashboard links (`/official-dashboard?id=`)
- **Field Staff** — staff table + **Daily Attendance**: auto-detected next unmarked staff, front-camera capture, auto date/time, optional GPS, photo preview/retake; records append to `data/attendance.csv`
- **Escalation Settings**, **Master Data Hub**
- **QR Manager** — generate/edit/delete/activate QR codes (complaint-form links or custom URLs), color & size options, live preview, PNG download, print sheet; ~50 zone QRs auto-synced with the Zones master list; custom codes persist in `localStorage`

### ITPO Dashboard (`/itpo-dashboard`)
- Complaints overview, workflow actions, zone switching

### Agency Dashboard (`/agency-dashboard`)
- Sidebar tabs: **Overview · All Complaints · Field Staff · Reports**
- Complaint overview cards (clickable filters), complaint table → themed **details modal** (status banner, details grid, evidence photos, audit timeline)
- **New Complaint** modal with image options and **QR scanner** (camera scan auto-fills zone/area/service from `BM360|zone|area|service` payloads)
- **Field Staff / Staff & Supervisors** view:
  - Stats (total, supervisors, field staff, active, pending), search + role/status filters
  - Per-row actions: edit, schedule shifts, manage zones, copy username, activate
  - **Two-level access**: Manager (full CRUD) vs Supervisor (view-only) toggle
  - **Add Supervisor** & **Add Field Staff** modals — locked partner agency, employee ID, designation, all-zone access or mapped zone, reporting supervisor, OTP mobile, auto-generated `@username`
- **Daily Attendance** button + post-mark summary card (name, "Marked Today", timestamp, GPS, photo)
- **Reports & Analytics** — complaint stats, complaints-by-zone bars, staff summary
- **Change Zone** modal (searchable ~50 zones) synced across all portals

### Individual Official Dashboard (`/official-dashboard?id=`)
- Official profile, tagged zones, assigned/resolved/pending stats, filtered complaints table

### Public Citizen Flow
- `/qr-codes` — generates printable QR codes for every zone encoding `/raise-complaint?zone=...`
- `/raise-complaint` — login-free mobile form pre-filled from QR params; submits to `data/complaints.csv` with a `CMP-XXXX` confirmation ID

### Cross-cutting
- **Operational Zone switcher** — themed modal with search, current-zone banner, confirm flow; reflected in sidebar + headers on all portals
- **Bilingual EN/हिंदी** toggle on all dashboards
- **Per-page browser titles** via `DocumentTitle`
- Unified teal theme (`#0b3c4a` / `#0e4c5e` / `#0f766e`) across every view
- Per-row action icons, status pills, avatar initials, sticky table headers

## Project Structure

```
app/
├── page.tsx                        # Login (mobile + OTP)
├── layout.tsx                      # Root layout + global metadata
├── dashboard/page.tsx              # Admin dashboard (all views)
├── dashboard/{itpo-officials,complaints,zones,areas,categories}/form/
├── itpo-dashboard/page.tsx         # ITPO portal
├── agency-dashboard/page.tsx       # Agency portal
├── agency-dashboard/complaint-details/  # Direct complaint-details URL → modal
├── agency-dashboard/register-complaint/ # Complaint registration route
├── official-dashboard/page.tsx     # Per-official dashboard (?id=)
├── raise-complaint/page.tsx        # Public citizen complaint form
├── qr-codes/page.tsx               # Printable zone QR generator
└── api/
    ├── attendance/route.ts         # Attendance CSV + photo persistence
    └── complaints/route.ts         # Citizen complaint CSV persistence
components/
├── RegisterComplaintModal.tsx      # New complaint + QR scanner
├── ComplaintDetailsModal.tsx       # Themed complaint details popup
├── ZoneSelectModal.tsx             # Switch Operational Zone
├── ZoneFormModal.tsx / AgencyFormModal.tsx / ItpoOfficialFormModal.tsx
├── AddSupervisorModal.tsx / AddFieldStaffModal.tsx
├── ImportEmployeesModal.tsx        # CSV + manual employee import
├── AttendanceModal.tsx             # Camera/GPS attendance capture
├── QrCodeModal.tsx                 # QR create/edit with live preview
└── DocumentTitle.tsx               # Per-page tab titles
lib/
├── zones.ts                        # ~50 zone names + ZoneRecord + defaults
├── agencies.ts                     # Agency/employee types + seed data
├── qrcodes.ts                      # QR record type + localStorage persistence
└── translations.ts                 # EN/HI dictionary
data/                               # Runtime CSVs + photos (git-ignored)
```

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000 — login with any mobile number, OTP `123456`.

### Useful URLs

- Admin: `/dashboard` → sidebar **QR Manager** for printable zone QR codes
- Citizen form preview: `/raise-complaint?zone=Hall%2014&area=Main%20Entrance`
- Attendance CSV download: `/api/attendance`

> **Camera features** (attendance photo, QR scan) require `localhost` or HTTPS.

## Data & Persistence

Most portal data is **in-memory/static** (resets on refresh) by design — the code is structured so it can later be backed by a database. The exceptions that persist to disk:

- `data/attendance.csv` + `data/photos/` — attendance records & camera photos
- `data/complaints.csv` — citizen-submitted complaints
- `localStorage` — custom QR codes (`bm360_qr_records`)

## Roadmap

- [ ] Database integration (PostgreSQL) replacing in-memory state
- [ ] Real authentication (NextAuth) replacing static OTP
- [ ] Surface citizen complaints (`complaints.csv`) inside agency/admin complaint queues
- [ ] Complaint image uploads to disk/S3
- [ ] Email/WhatsApp notifications
- [ ] Scan analytics for QR codes
- [ ] Report exports (Excel/PDF)

## License

Proprietary software for Bharat Mandapam. All rights reserved.
