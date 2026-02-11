import React, { useContext, useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import Medications from "./Medications";
import Appointments from "./Appointments";
import Profile from "./Profile";
import HealthAnalytics from "./HealthAnalytics";
import PrescriptionManager from "./PrescriptionManager";
import MedicationRefill from "./MedicationRefill";
import VideoConsultation from "./VideoConsultation";
import NotificationCenter from "./NotificationCenter";
import HospitalManagement from "./HospitalManagement";
import OrderHistory from "./OrderHistory";
import Settings from "./Settings";
import "./Dashboard.css";

// View Components
const MedicationsView = () => (
  <div className="feature-content">
    <h1>Medications</h1>
    <Medications />
  </div>
);

const AppointmentsView = () => (
  <div className="feature-content">
    <h1>Appointments</h1>
    <Appointments />
  </div>
);

const ProfileView = () => (
  <div className="feature-content">
    <h1>Profile</h1>
    <Profile embedded />
  </div>
);

const AnalyticsView = () => (
  <div className="feature-content">
    <h1>Health Analytics</h1>
    <HealthAnalytics />
  </div>
);

const PrescriptionsView = () => (
  <div className="feature-content">
    <h1>Prescriptions</h1>
    <PrescriptionManager />
  </div>
);

const RefillsView = () => (
  <div className="feature-content">
    <h1>Medication Refills</h1>
    <MedicationRefill />
  </div>
);

const OrdersView = () => (
  <div className="feature-content">
    <h1>Order History</h1>
    <OrderHistory embedded />
  </div>
);

const ConsultationView = () => (
  <div className="feature-content">
    <h1>Video Consultation</h1>
    <VideoConsultation />
  </div>
);

const NotificationsView = () => (
  <div className="feature-content">
    <h1>Notifications</h1>
    <NotificationCenter />
  </div>
);

const HospitalsView = () => (
  <div className="feature-content">
    <h1>Hospital Management</h1>
    <HospitalManagement />
  </div>
);

const DASHBOARD_FEATURES = [
  {
    title: "Medications",
    summary: "Track schedules, adherence, and approved prescriptions in one place.",
    tag: "Care"
  },
  {
    title: "Doctor Appointments",
    summary: "Book, reschedule, and sync in-person or video visits.",
    tag: "Visits"
  },
  {
    title: "Prescription Management",
    summary: "Upload prescriptions (PDF/image) and view doctor-approved scripts.",
    tag: "Rx"
  },
  {
    title: "Health Analytics",
    summary: "View adherence trends, vitals, and personalized insights.",
    tag: "Insights"
  },
  {
    title: "Order History & Tracking",
    summary: "Review payments, reorder items, and follow delivery status.",
    tag: "Orders"
  },
  {
    title: "Video Consultation",
    summary: "Join HIPAA-compliant video calls with your care team.",
    tag: "Telehealth"
  },
  {
    title: "Hospitals Directory",
    summary: "Browse partner hospitals like City Hospital and view their doctors.",
    tag: "Network"
  }
];

const DashboardLanding = ({ title, subtitle, features, quickStats, recentActivity, onPrimaryAction }) => (
  <div className="dashboard-placeholder">
    <div className="dashboard-placeholder__header">
      <p className="dashboard-placeholder__eyebrow">Home hub</p>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <div className="dashboard-placeholder__cta">
        <button className="dashboard-primary-btn" onClick={onPrimaryAction}>
          Schedule next appointment
        </button>
        <p className="dashboard-placeholder__hint">Plan your upcoming visit or refill with one click.</p>
      </div>
    </div>

    <section className="dashboard-insights">
      <div className="dashboard-insights__stats">
        {quickStats.map((stat) => (
          <article key={stat.id} className="dashboard-stat-card" aria-label={stat.label}>
            <div className="dashboard-stat-card__icon" aria-hidden>
              <span>{stat.icon}</span>
            </div>
            <div>
              <p className="dashboard-stat-card__label">{stat.label}</p>
              <p className="dashboard-stat-card__value">{stat.value}</p>
              <p className="dashboard-stat-card__meta">{stat.meta}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="dashboard-insights__activity">
        <div className="activity-header">
          <h3>Recent activity</h3>
          <p>Latest updates from your care journey</p>
        </div>
        <ul>
          {recentActivity.map((item) => (
            <li key={item.id} className="activity-row">
              <div>
                <p className="activity-row__title">{item.title}</p>
                <p className="activity-row__meta">{item.detail}</p>
              </div>
              <span>{item.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>

    <div className="dashboard-placeholder__grid">
      {features.map((feature) => (
        <article key={feature.title} className="dashboard-placeholder__card" tabIndex={0}>
          <span className="dashboard-placeholder__tag">{feature.tag}</span>
          <h3>{feature.title}</h3>
          <p>{feature.summary}</p>
        </article>
      ))}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [profile, setProfile] = useState(null);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Load user profile
  useEffect(() => {
    if (user && user.id) {
      try {
        const profileData = JSON.parse(localStorage.getItem(`profile_${user.id}`) || '{}');
        setProfile(profileData);
          // ...removed console.log for production...
      } catch (error) {
        console.error('Error loading profile:', error);
        setProfile({});
      }
    }
  }, [user]);

  // Apply user dashboard default landing view when visiting /dashboard
  useEffect(() => {
    if (!user || !user.id) return;
    if (location.pathname !== "/dashboard") return;

    try {
      const raw = localStorage.getItem(`settings_${user.id}`);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const defaultView = parsed?.preferences?.userDashboardDefault;
      if (defaultView && defaultView !== "home") {
        navigate(`/dashboard/${defaultView}`);
      }
    } catch (error) {
      console.error("Error applying dashboard settings:", error);
    }
  }, [user, location.pathname, navigate]);

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { greeting: "Good Morning", icon: "☀️" };
    if (hour < 17) return { greeting: "Good Afternoon", icon: "☀️" };
    return { greeting: "Good Evening", icon: "🌙" };
  };

  const { greeting, icon } = getTimeBasedGreeting();

  // Role-based dashboard title and subtitle
  const getDashboardContent = () => {
    if (user?.role === "Caretaker") {
      return {
        title: `${greeting}, Caretaker ${profile?.name || user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'} ${icon}`,
        subtitle: "Manage your patients' health journey"
      };
    } else {
      return {
        title: `${greeting}, ${profile?.name || user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'} ${icon}`,
        subtitle: "Let’s get you started with your health journey"
      };
    }
  };

  const { title, subtitle } = getDashboardContent();

  const quickStats = [
    { id: "adherence", label: "Adherence", value: "92%", meta: "This week", icon: "🕒" },
    { id: "medications", label: "Active meds", value: "6", meta: "2 refills due", icon: "💊" },
    { id: "appointments", label: "Upcoming visits", value: "3", meta: "Next on Thu", icon: "📅" },
    { id: "alerts", label: "Alerts", value: "2", meta: "Needs attention", icon: "⚠️" }
  ];

  const recentActivity = [
    { id: "rx-1", title: "Vitamin D refill approved", detail: "Dr. Menon • Rx-2214", time: "2h ago" },
    { id: "appt-1", title: "Consultation moved to 4 PM", detail: "Dr. Rao • Video", time: "Today" },
    { id: "order-1", title: "Order #982417 packed", detail: "Arrives in 2 days", time: "Yesterday" }
  ];

  const handlePrimaryAction = () => navigate("/dashboard/appointments");

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <TopNavbar />

      <main className="dashboard-main">
        {!user ? (
          <div className="dashboard-loader" aria-live="polite">
            <div className="skeleton skeleton-pill" />
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-cards" />
          </div>
        ) : (
          <Routes>
            <Route
              index
              element={
                <DashboardLanding
                  title={title}
                  subtitle={subtitle}
                  features={DASHBOARD_FEATURES}
                  quickStats={quickStats}
                  recentActivity={recentActivity}
                  onPrimaryAction={handlePrimaryAction}
                />
              }
            />
            <Route path="medications" element={<MedicationsView />} />
            <Route path="appointments" element={<AppointmentsView />} />
            <Route path="profile" element={<ProfileView />} />
            <Route path="analytics" element={<AnalyticsView />} />
            <Route path="prescriptions" element={<PrescriptionsView />} />
            <Route path="refills" element={<RefillsView />} />
            <Route path="orders" element={<OrdersView />} />
            <Route path="consultation" element={<ConsultationView />} />
            <Route path="notifications" element={<NotificationsView />} />
            <Route path="hospitals" element={<HospitalsView />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
