# Online Medicose - Modern Healthcare & Medication Management Platform

![GitHub last commit](https://img.shields.io/github/last-commit/your-username/online-medicose?style=flat-square)
![GitHub repo size](https://img.shields.io/github/repo-size/your-username/online-medicose?style=flat-square)
![License](https://img.shields.io/github/license/your-username/online-medicose?style=flat-square)
![Issues](https://img.shields.io/github/issues/your-username/online-medicose?style=flat-square)
![Node.js CI](https://img.shields.io/github/actions/workflow/status/your-username/online-medicose/node.js.yml?style=flat-square)


## Overview
Online Medicose is a full-stack healthcare and medication management platform built with React, Node.js, Express, and MongoDB. It supports patients, doctors, and pharmacists with:
- Medication tracking and reminders
- Appointment booking and management
- Prescription uploads and OCR (scan or photo)
- Real-time chatbot assistant (with camera/photo scan)
- Multi-role dashboards (Patient, Doctor, Pharmacist)
- Secure authentication and role-based access

## 🚀 Key Features

- **Authentication**: Secure signup/login, JWT-based sessions
- **Chatbot Assistant**: Floating chat widget with:
   - Natural language Q&A
   - Camera/photo scan for prescriptions (OCR powered by Tesseract.js)
   - Quick actions for appointments, refills, and more
- **Medication Management**: Add, edit, schedule, and refill medicines
- **Appointments**: Book, reschedule, and cancel doctor visits
- **Prescription Management**: Upload or scan prescriptions, auto-extract medicines
- **Dashboards**:
   - Patient: Medications, appointments, analytics, shop, order tracking
   - Doctor: Patient management, appointments, reports
   - Pharmacist: Inventory, prescription verification, refills
- **Video Consultation**: Secure video calls with doctors
- **Notifications**: Real-time alerts for appointments, refills, and more
- **Health Analytics**: Charts and insights on adherence and health trends

### Core Features
- **User Authentication**: Secure login and signup with password validation
- **Medication Management**: Add, edit, delete, and schedule medications with time-based reminders
- **Doctor Appointments**: Book, track, and manage doctor appointments with calendar view
- **User Profile**: Comprehensive profile with health information, emergency contacts, and document storage

### Advanced Features :-
- **In-App Notification Center**: Real-time notifications with filtering by type (appointment, medication, health, prescription)
- **Health Analytics Dashboard**: Visual charts showing medication adherence, health metrics, and trends
- **Prescription Management**: Upload and manage prescriptions with expiry tracking and refill alerts
- **Doctor Dashboard**: Multi-role interface for doctors to manage patients and appointments
- **Video Consultation**: Schedule and conduct secure video consultations with doctors
- **Medication Refill System**: Easy medication refill requests with pharmacy comparison and auto-refill options
- **Multi-User Support**: Different roles - Patient, Doctor, Caretaker


## 🖼️ Screenshots

<p align="center">
   <img src="docs/screenshots/dashboard.png" alt="Dashboard Screenshot" width="600" />
   <br />
   <img src="docs/screenshots/chatbot.png" alt="Chatbot Screenshot" width="350" />
   <br />
   <img src="docs/screenshots/doctor-dashboard.png" alt="Doctor Dashboard Screenshot" width="600" />
</p>

> _Add your own screenshots to `docs/screenshots/` for a richer README!_

## 📁 Project Structure
---

## 📖 API Documentation

### Authentication
- `POST /api/auth/signup` – Register a new user
- `POST /api/auth/login` – Login and receive JWT

### Medicines
- `GET /api/medicines` – List all medicines
- `POST /api/medicines` – Add a new medicine (admin/doctor)

### Orders
- `POST /api/orders` – Create a new order
- `GET /api/orders` – List user orders

### Appointments
- `POST /api/appointments` – Book an appointment
- `GET /api/appointments` – List appointments

### Prescriptions
- `POST /api/prescriptions` – Upload a prescription
- `GET /api/prescriptions` – List prescriptions

### Chatbot
- `POST /api/chat` – Send a message to the chatbot

> _Expand this section with request/response examples as needed._

```
Online-Medicose/
├── backend/                # Express/MongoDB backend (server.mjs, models/)
├── server/                 # Static/public assets
├── src/                    # React frontend source
│   ├── App.jsx             # Main app entry
│   ├── Chatbot.jsx         # Chatbot logic (camera, OCR, quick actions)
│   ├── ChatWindow.jsx      # Chatbot UI shell
│   ├── chatService.js      # API helpers for chatbot
│   ├── useAppointmentFlow.js # Appointment flow logic
│   ├── [Feature].jsx       # Pages: Medications, Appointments, Profile, etc.
│   ├── components/         # UI components (Button, Card, Input, etc.)
│   └── *.css               # CSS modules for each feature
├── package.json            # Scripts and dependencies
├── README.md               # This file
└── ...
```

```
src/
├── App.js                      # Main routing configuration
├── Home.jsx                    # Landing page with navigation
├── Login.jsx                   # User authentication
├── Signup.jsx                  # User registration with validation
├── Profile.jsx                 # User profile management
├── Medications.jsx             # Medication management & scheduling
├── Appointments.jsx            # Doctor appointment system
├── NotificationCenter.jsx       # In-app notifications (NEW)
├── HealthAnalytics.jsx         # Health dashboard & charts (NEW)
├── DoctorDashboard.jsx         # Doctor management interface (NEW)
├── PrescriptionManager.jsx     # Prescription handling (NEW)
├── VideoConsultation.jsx       # Video call scheduling (NEW)
├── MedicationRefill.jsx        # Medication refill requests (NEW)
└── [Component].css             # Corresponding CSS files
```

## 🎯 Main Components & Flows

- **Chatbot.jsx / ChatWindow.jsx**: Floating assistant with camera/photo scan, OCR, and quick actions for appointments, refills, and more.
- **AuthContext.jsx**: Handles authentication and user context.
- **Dashboard.jsx**: Main dashboard shell for each role (Patient, Doctor, Pharmacist).
- **Medications.jsx**: Manage, schedule, and refill medicines.
- **Appointments.jsx**: Book, reschedule, and cancel appointments.
- **PrescriptionManager.jsx**: Upload, scan, and manage prescriptions (with OCR extraction).
- **NotificationCenter.jsx**: Real-time notifications and alerts.
- **HealthAnalytics.jsx**: Charts and health insights.
- **OrderHistory.jsx / OrderTracking.jsx**: E-commerce and order management.
- **VideoConsultation.jsx**: Secure video calls with doctors.

### Authentication
- **Login.jsx**: User login with email and password validation
- **Signup.jsx**: User registration with password strength requirements

### Main Pages
- **Home.jsx**: Landing page with features and navigation
- **Profile.jsx**: User profile with health information, documents, emergency contacts
- **Medications.jsx**: Medication tracking with scheduling and reminders

### Appointment System
- **Appointments.jsx**: Calendar-based appointment booking with multi-view support

### Advanced Features (New)
1. **NotificationCenter.jsx** 
   - Real-time notification management
   - Filter by type (appointment, medication, health, prescription)
   - Mark as read/unread, delete notifications
   - Badge showing unread count

2. **HealthAnalytics.jsx**
   - Bar chart visualization of medication adherence
   - Time-based views (week, month, year)
   - Health metrics display
   - Medication performance statistics
   - Health insights and recommendations
   - Report generation for patient health data

   - Request refills from pharmacies
   - View detailed prescription information
   - Expiry alerts and reminders

   - Schedule consultations with doctors
   - Video call interface with controls

6. **MedicationRefill.jsx**
   - Request medication refills
   - Compare pharmacies by rating, delivery time, distance
   - Track refill order status
   - Stock level monitoring with alerts
## 🗂️ Dashboards & Roles

### Patient Dashboard
- Medications, appointments, prescriptions, analytics, shop, order tracking, notifications, video consults, and more.

### Doctor Dashboard
- Patient management, appointments, prescriptions, analytics, reports, telehealth queue.

### Pharmacist Dashboard
- Prescription verification, inventory, refills, audit log, compliance.

- **Entry Point**: `/dashboard` wrapped by `Dashboard.jsx` with `Sidebar` + `TopNavbar` chrome and role-aware greetings.
- **Home Hub**: Hero panel with quick stats (adherence, refills, visits, alerts), recent activity feed, and feature cards guiding users to key modules.
- **Commerce & Tracking**: Integrated Shop, Cart, Order History, and Order Tracking keep e-commerce tasks within the same shell.
- **Accessibility Focus**: Skeleton loaders, card focus states, and dashboard CTA hints ensure patients and caretakers have a predictable navigation experience.

### Doctor Dashboard
- **Route**: `/doctor-dashboard?tab=overview|patients|appointments|prescriptions` guarded for Doctor role.
- **Hero Surface**: Gradient workspace with patient load, active wards, and response-time metrics plus shortcut grid for quick triage actions.
- **Tab Highlights**:
   - *Overview*: Alerts, rounds summary, backlog indicators.
   - *Patients*: Cohort table with adherence, risk level, and plan status.
   - *Appointments*: Upcoming visit cards with complete/reschedule buttons.
   - *Prescriptions*: Lab orders, medication approvals, and report exports.
- **Supporting Widgets**: Reports grid, telehealth queue, and care-team broadcasts styled via `DoctorDashboard.css` to stay distinct from the patient shell.

### Pharmacist Dashboard
- **Route**: `/pharmacist-dashboard?tab=overview|prescriptions|inventory|refills` limited to Pharmacist role.
- **Hero Experience**: Glassmorphic gradient hero showing verification queue, low-stock alerts, expiring lots, and CTAs for dispense/inventory/refill flows.
- **Key Sections**:
   - *Overview*: Pipeline metrics, supply-chain timeline, compliance/audit log, environment vitals.
   - *Prescriptions*: Verification queue with approve/escalate controls, controlled-substance board.
   - *Inventory*: Stock ledger, expiring batches, purchase orders, cold-chain logs.
   - *Refills*: Refill status board, patient messages, SLA tracking.
- **Action Shortcuts**: Card grid for verification, cold-chain monitoring, and controlled Rx workflows with contextual metrics and CTA buttons.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, CSS modules
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **OCR**: Tesseract.js (browser-based)
- **State Management**: React Context, Hooks
- **APIs**: REST (Express), JWT Auth
- **Testing**: React Testing Library, Jest

- **Frontend**: React 19 
- **Styling**: CSS
- **State Management**: React Hooks (useState)
- **Browser APIs**: FileReader for uploads, Date APIs
- **Architecture**: Component-based modular design


## ▶️ Getting Started

These steps assume you are in the project folder:

```bash
cd Online-Medicose/Online-Medicose
```

### 1. Install dependencies

```bash
npm install
```

```bash
npm install
```

### 2. (Optional) Configure environment variables

Create a `.env` file in `Online-Medicose/Online-Medicose` for real MongoDB + JWT (otherwise, demo mode is used):

```ini
MONGODB_URI=mongodb://localhost:27017/online-medicose
JWT_SECRET=your-strong-secret
VITE_API_BASE_URL=http://localhost:5000/api
```

- If `MONGODB_URI` is **not** set, backend runs in **demo mode** (no real DB, demo users/data only).

Create a `.env` file in `Online-Medicose/Online-Medicose` if you want real MongoDB + JWT instead of demo mode:

```ini
MONGODB_URI=mongodb://localhost:27017/online-medicose
JWT_SECRET=some-strong-secret
VITE_API_BASE_URL=http://localhost:5000/api
```

- If `MONGODB_URI` is **not** set, the backend runs in **demo mode**:
   - Auth accepts any credentials and returns a demo user.
   - Medicines, orders, and appointments are stored in memory for the session.

### 3. Start the backend (Node/Express)

```bash
npm run server
```

From `Online-Medicose/Online-Medicose`:

```bash
npm run server
```

This starts the MERN backend on `http://localhost:5000` with routes such as:

- `POST /api/auth/signup` – create user
- `POST /api/auth/login` – login user
- `GET  /api/medicines` – list medicines
- `POST /api/orders`, `GET /api/orders` – create/list orders
- `POST /api/appointments`, `GET /api/appointments` – create/list appointments
- `POST /api/chat` – chatbot replies

### 4. Start the frontend (React + Vite)

```bash
npm run dev
```

In a second terminal, from the same folder:

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### 5. Key Flows to Test

- **Signup/Login**: `/api/auth/signup`, `/api/auth/login`
- **Chatbot**: Floating widget, camera/photo scan, OCR, quick actions
- **Medications**: `/api/medicines`, add/edit/schedule/refill
- **Appointments**: `/api/appointments`, book/reschedule/cancel
- **Prescriptions**: Upload/scan, OCR extraction, create draft prescriptions
- **Shop/Orders**: `/api/orders`, cart, checkout, order tracking

- **Signup/Login**: Uses `/api/auth/signup` and `/api/auth/login`.
- **Shop**: Loads medicines from `/api/medicines` (falls back to sample data if needed).
- **Cart → Checkout**: Creates an order via `/api/orders` and routes to Order History.
- **Order History**: Fetches user orders via `/api/orders?userId=&userEmail=` and overlays them on the existing UI.
- **Appointments**: Books/reschedules appointments locally and syncs them to `/api/appointments`.
- **Chatbot**: Sends messages to `/api/chat` and displays replies in the floating widget.



## 🔐 Security & Privacy

- Password strength validation
- JWT-based authentication
- Secure file upload & validation
- Data privacy best practices

- Password strength validation during signup
- Session-based authentication structure
- Secure form handling
- File upload validation for documents
- Data privacy considerations

## 🎨 UI/UX

- Modern, responsive design
- Floating chatbot with camera/photo scan
- Smooth transitions, color-coded badges
- Accessible navigation, focus states
- Toast notifications, progress bars

- Gradient color scheme (purple/pink theme)
- Smooth transitions and hover effects
- Clear status indicators and color-coded badges
- Modal dialogs for detailed views
- Intuitive navigation with breadcrumbs
- Progress bars and loading indicators
- Toast-style notifications




