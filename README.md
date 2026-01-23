# Online Medicose - Comprehensive Medication Management System

## Overview
Online Medicose is a full-featured medication management application built with React that helps patients manage their medications, track adherence, schedule appointments, and maintain comprehensive health records. It includes support for doctors, caretakers, and multiple advanced health management features.

## 🚀 Features

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

## 📁 Project Structure

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

## 🎯 Components Overview :-

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

3. **DoctorDashboard.jsx**
   - Multi-tab interface (Overview, Patients, Appointments, Reports)
   - Patient management with adherence tracking
   - Appointment scheduling and tracking
   - Report generation for patient health data

4. **PrescriptionManager.jsx**
   - Upload and manage prescriptions
   - Track prescription expiry dates
   - Request refills from pharmacies
   - View detailed prescription information
   - Expiry alerts and reminders

5. **VideoConsultation.jsx**
   - Schedule consultations with doctors
   - Video call interface with controls
   - In-call chat functionality
   - Consultation history tracking
   - Feedback and ratings system

6. **MedicationRefill.jsx**
   - Request medication refills
   - Compare pharmacies by rating, delivery time, distance
   - Auto-refill setup
   - Track refill order status
   - Stock level monitoring with alerts

## 🛠️ Tech Stack

- **Frontend**: React 19 
- **Styling**: CSS
- **State Management**: React Hooks (useState)
- **Browser APIs**: FileReader for uploads, Date APIs
- **Architecture**: Component-based modular design



## 🔐 Security Features

- Password strength validation during signup
- Session-based authentication structure
- Secure form handling
- File upload validation for documents
- Data privacy considerations

## 🎨 UI/UX Features

- Gradient color scheme (purple/pink theme)
- Smooth transitions and hover effects
- Clear status indicators and color-coded badges
- Modal dialogs for detailed views
- Intuitive navigation with breadcrumbs
- Progress bars and loading indicators
- Toast-style notifications




