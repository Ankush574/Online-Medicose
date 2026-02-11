# Online Medicose - Modern Healthcare & Medication Management Platform

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

### Advanced Features
- **In-App Notification Center**: Real-time notifications with filtering by type (appointment, medication, health, prescription)
- **Health Analytics Dashboard**: Visual charts showing medication adherence, health metrics, and trends
- **Prescription Management**: Upload and manage prescriptions with expiry tracking and refill alerts
- **Doctor Dashboard**: Multi-role interface for doctors to manage patients and appointments
- **Video Consultation**: Schedule and conduct secure video consultations with doctors
- **Medication Refill System**: Easy medication refill requests with pharmacy comparison and auto-refill options
- **Multi-User Support**: Different roles - Patient, Doctor, Caretaker

## 🏗️ Project Structure
```
src/
  App.jsx                  # Main routing configuration
  Home.jsx                 # Landing page
  Login.jsx                # User authentication
  Signup.jsx               # User registration
  Profile.jsx              # User profile management
  Medications.jsx          # Medication management
  Appointments.jsx         # Doctor appointment system
  NotificationCenter.jsx   # In-app notifications
  HealthAnalytics.jsx      # Health dashboard
  DoctorDashboard.jsx      # Doctor management
  PrescriptionManager.jsx  # Prescription handling
  VideoConsultation.jsx    # Video call scheduling
  MedicationRefill.jsx     # Medication refill requests
  ...
backend/
  server.mjs               # Express server
  models/                  # Mongoose models
  ...
```

## 🖥️ Installation & Setup
1. Clone the repository
2. Install dependencies:
   - Frontend: `npm install` (in root or src/)
   - Backend: `npm install` (in backend/)
3. Start the backend server: `npm run dev` (in backend/)
4. Start the frontend: `npm run dev` (in root or src/)

## 📸 Screenshots
Add screenshots in a `docs/screenshots/` folder and reference them here for dashboard, chatbot, etc.

## 🤖 Technologies Used
- React, Vite, Tailwind CSS
- Node.js, Express
- MongoDB, Mongoose
- JWT, bcrypt
- Tesseract.js (OCR)

## 📄 API Endpoints
Document your main API endpoints here (auth, medications, appointments, etc.)

## 🧑‍💻 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📜 License
MIT




