import React, { useState, useContext, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import Card from "./components/Card";
import Button from "./components/Button";
import StatCard from "./components/StatCard";
import Settings from "./Settings";
import "./DoctorDashboard.css";

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [profile, setProfile] = useState(null);
  const [patients, setPatients] = useState([
    {
      id: 1,
      name: "John Doe",
      age: 45,
      email: "john@example.com",
      phone: "555-0101",
      lastVisit: "2024-01-05",
      adherence: 92,
      status: "Stable",
      history: ["Type 2 Diabetes", "Hypertension"],
      medications: ["Metformin", "Lisinopril"]
    },
    {
      id: 2,
      name: "Jane Smith",
      age: 38,
      email: "jane@example.com",
      phone: "555-0102",
      lastVisit: "2024-01-03",
      adherence: 78,
      status: "Needs Attention",
      history: ["Hyperlipidemia"],
      medications: ["Atorvastatin"]
    },
    {
      id: 3,
      name: "Robert Wilson",
      age: 62,
      email: "robert@example.com",
      phone: "555-0103",
      lastVisit: "2024-01-08",
      adherence: 85,
      status: "Stable",
      history: ["Post-op knee replacement"],
      medications: ["Tramadol"]
    }
  ]);

  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patientName: "John Doe",
      date: "2024-01-12",
      time: "10:00 AM",
      reason: "Regular checkup",
      notes: "Blood pressure slightly elevated"
    },
    {
      id: 2,
      patientName: "Jane Smith",
      date: "2024-01-12",
      time: "2:30 PM",
      reason: "Follow-up consultation",
      notes: "Review medication effects"
    }
  ]);

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTab = searchParams.get("tab") || "overview";
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([
    {
      id: "RX-1201",
      patientName: "John Doe",
      medication: "Metformin",
      dosage: "500 mg",
      route: "Oral",
      duration: "90 days",
      refills: 2,
      status: "Draft",
      diagnosis: "Type 2 Diabetes",
      controlled: false,
      lastAction: "Drafted Jan 25"
    },
    {
      id: "RX-1205",
      patientName: "Jane Smith",
      medication: "Atorvastatin",
      dosage: "10 mg",
      route: "Oral",
      duration: "60 days",
      refills: 1,
      status: "Signed",
      diagnosis: "Hyperlipidemia",
      controlled: false,
      lastAction: "Signed Jan 20"
    },
    {
      id: "RX-1210",
      patientName: "Robert Wilson",
      medication: "Tramadol",
      dosage: "50 mg",
      route: "Oral",
      duration: "14 days",
      refills: 0,
      status: "Dispensed",
      diagnosis: "Post-op pain",
      controlled: true,
      lastAction: "Dispensed Jan 18"
    }
  ]);
  const [refillApprovals, setRefillApprovals] = useState([
    {
      id: "REF-901",
      patientName: "Sarah Malik",
      medication: "Levothyroxine",
      requestedOn: "Jan 28",
      lastVisit: "Dec 10",
      status: "Pending"
    },
    {
      id: "REF-905",
      patientName: "John Doe",
      medication: "Metformin",
      requestedOn: "Jan 29",
      lastVisit: "Jan 05",
      status: "Pending"
    }
  ]);
  const [newPrescription, setNewPrescription] = useState({
    patientName: "",
    medication: "",
    dosage: "",
    route: "Oral",
    duration: "7 days",
    refills: 0,
    diagnosis: "",
    notes: "",
    controlled: false
  });
  const [interactionFlags, setInteractionFlags] = useState([]);
  const [patientRequests, setPatientRequests] = useState([
    {
      id: "REQ-301",
      patientName: "Maya Kapoor",
      requestType: "Medicine Refill",
      message: "Need 30-day refill for Levothyroxine.",
      submittedAt: "Today, 09:12",
      status: "Pending"
    },
    {
      id: "REQ-304",
      patientName: "Alok Menon",
      requestType: "Consultation",
      message: "Review uploaded skin rash images.",
      submittedAt: "Yesterday, 19:05",
      status: "Pending"
    }
  ]);
  const [uploadedPrescriptions, setUploadedPrescriptions] = useState([
    {
      id: "UPLOAD-11",
      patientName: "Rahul Sharma",
      fileType: "PDF",
      uploadedAt: "Jan 30",
      notes: "Discharge summary from City Hospital",
      reviewed: false
    },
    {
      id: "UPLOAD-12",
      patientName: "Sophia Patel",
      fileType: "Image",
      uploadedAt: "Jan 29",
      notes: "Dermatology script",
      reviewed: true
    }
  ]);
  const [consultationNotes, setConsultationNotes] = useState({});
  const [prescriptionHistory, setPrescriptionHistory] = useState([
    { id: "LOG-01", action: "Signed RX-1205", actor: "Dr. Rao", timestamp: "Jan 20, 10:12" },
    { id: "LOG-02", action: "Dispensed RX-1210", actor: "Pharmacist", timestamp: "Jan 18, 16:05" }
  ]);

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
      } catch (error) {
        console.error('Error loading profile:', error);
        setProfile({});
      }
    }
  }, [user]);


  const getAdherenceColor = (adherence) => {
    if (adherence >= 90) return "text-green-600";
    if (adherence >= 80) return "text-blue-600";
    return "text-yellow-600";
  };

  const handlePrescriptionFieldChange = (field, value) => {
    setNewPrescription((prev) => ({ ...prev, [field]: value }));
    if (field === "medication") {
      runInteractionChecks(value);
    }
  };

  const runInteractionChecks = (medication) => {
    if (!medication) {
      setInteractionFlags([]);
      return;
    }
    const normalized = medication.toLowerCase();
    const flags = [];
    if (normalized.includes("ibuprofen")) {
      flags.push({
        id: "flag-ibuprofen",
        title: "NSAID warning",
        detail: "Requires stomach protection for long-term use."
      });
    }
    if (normalized.includes("tramadol")) {
      flags.push({
        id: "flag-opioid",
        title: "Controlled substance",
        detail: "Schedule IV — digital signature + countersign required."
      });
    }
    setInteractionFlags(flags);
  };

  const handleCreatePrescription = (event) => {
    event.preventDefault();
    if (!newPrescription.patientName || !newPrescription.medication) return;

    const nextId = `RX-${Math.floor(Math.random() * 9000) + 1200}`;
    const payload = {
      ...newPrescription,
      id: nextId,
      status: "Draft",
      lastAction: "Drafted just now"
    };
    setPrescriptions((prev) => [payload, ...prev]);
    setPrescriptionHistory((prev) => [
      { id: `LOG-${prev.length + 3}`, action: `Created ${nextId} for ${payload.patientName}`, actor: `Dr. ${profile?.name || user?.name || 'You'}`, timestamp: new Date().toLocaleString() },
      ...prev
    ]);
    setNewPrescription({
      patientName: "",
      medication: "",
      dosage: "",
      route: "Oral",
      duration: "7 days",
      refills: 0,
      diagnosis: "",
      notes: "",
      controlled: false
    });
    setInteractionFlags([]);
  };

  const advancePrescriptionStatus = (id) => {
    const flow = ["Draft", "Signed", "Dispensed"];
    setPrescriptions((prev) =>
      prev.map((rx) => {
        if (rx.id !== id) return rx;
        const current = flow.indexOf(rx.status);
        const next = flow[Math.min(current + 1, flow.length - 1)];
        return {
          ...rx,
          status: next,
          lastAction: `${next} ${new Date().toLocaleDateString()}`
        };
      })
    );
  };

  const handleRefillDecision = (requestId, approve) => {
    setRefillApprovals((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? { ...req, status: approve ? "Approved" : "Declined" }
          : req
      )
    );
    setPrescriptionHistory((prev) => [
      {
        id: `LOG-${prev.length + 5}`,
        action: `${approve ? 'Approved' : 'Declined'} ${requestId}`,
        actor: `Dr. ${profile?.name || user?.name || 'You'}`,
        timestamp: new Date().toLocaleString()
      },
      ...prev
    ]);
  };

  const handlePatientRequest = (requestId, decision) => {
    setPatientRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: decision } : req
      )
    );
  };

  const toggleUploadedPrescription = (uploadId) => {
    setUploadedPrescriptions((prev) =>
      prev.map((doc) =>
        doc.id === uploadId ? { ...doc, reviewed: !doc.reviewed } : doc
      )
    );
  };

  const updateConsultationNote = (appointmentId, note) => {
    setConsultationNotes((prev) => ({ ...prev, [appointmentId]: note }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Stable": return "text-green-600 bg-green-100";
      case "Needs Attention": return "text-yellow-600 bg-yellow-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { greeting: "Good Morning", icon: "☀️" };
    if (hour < 17) return { greeting: "Good Afternoon", icon: "☀️" };
    return { greeting: "Good Evening", icon: "🌙" };
  };

  const { greeting, icon } = getTimeBasedGreeting();

  const { title, subtitle } = {
    title: `${greeting}, Dr. ${profile?.name || user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Doctor'} ${icon}`,
    subtitle: "Manage your patients' health and appointments"
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "patients", label: "Patients", icon: "👥" },
    { id: "appointments", label: "Appointments", icon: "📅" },
    { id: "prescriptions", label: "Prescriptions", icon: "💊" },
    { id: "settings", label: "Settings", icon: "⚙️" }
  ];
  const isValidTab = tabs.some((tab) => tab.id === selectedTab);
  const doctorFeatureCatalog = [
    {
      title: "Verified Doctor Login",
      detail: "Admin-approved onboarding with license + DEA validation",
      icon: "✅"
    },
    {
      title: "Patient Requests Inbox",
      detail: "Triage medicine refills, consultations, and follow-ups",
      icon: "📥"
    },
    {
      title: "Uploaded Prescription Review",
      detail: "View patient PDFs/images before issuing e-prescriptions",
      icon: "📄"
    },
    {
      title: "E-Prescription Composer",
      detail: "Add dosage, instructions, and consultation notes",
      icon: "💊"
    },
    {
      title: "Prescription Ledger",
      detail: "Full history of issued/dispensed scripts for compliance",
      icon: "📚"
    }
  ];
  const formattedTime = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const doctorQuickInsights = [
    {
      id: "patients",
      label: "Active Patients",
      value: patients.length,
      detail: "+3 this week",
      gradient: "from-indigo-500 via-purple-500 to-purple-600",
      icon: "👥"
    },
    {
      id: "schedule",
      label: "Today's Sessions",
      value: appointments.length,
      detail: "2 virtual consults",
      gradient: "from-pink-500 via-rose-500 to-orange-500",
      icon: "🕒"
    },
    {
      id: "refills",
      label: "Refill Approvals",
      value: refillApprovals.filter((item) => item.status === "Pending").length,
      detail: "Need signatures",
      gradient: "from-emerald-500 via-green-500 to-teal-500",
      icon: "✅"
    },
    {
      id: "alerts",
      label: "Patient Alerts",
      value: patientRequests.filter((req) => req.status === "Pending").length,
      detail: "Awaiting response",
      gradient: "from-amber-500 via-yellow-500 to-orange-500",
      icon: "⚠️"
    }
  ];

  const doctorActionShortcuts = [
    {
      id: "draft",
      title: "Draft prescription",
      description: "Prefill dosage & refills",
      icon: "✍️",
      action: () => setSearchParams({ tab: "prescriptions" })
    },
    {
      id: "triage",
      title: "Triage requests",
      description: "Review patient inbox",
      icon: "📬",
      action: () => setSearchParams({ tab: "overview" })
    },
    {
      id: "consult",
      title: "Start consult",
      description: "Launch video room",
      icon: "🎥",
      action: () => navigate("/dashboard/consultation")
    }
  ];

  const pendingPatientRequests = patientRequests.filter((req) => req.status === "Pending");
  const controlledPrescriptions = prescriptions.filter((rx) => rx.controlled);
  const draftPrescriptions = prescriptions.filter((rx) => rx.status === "Draft");
  const appointmentTimeline = appointments.slice(0, 4).map((appointment) => ({
    id: appointment.id,
    patient: appointment.patientName,
    time: `${appointment.date} • ${appointment.time}`,
    reason: appointment.reason
  }));
  const complianceCallouts = [
    { id: "controlled", label: "Controlled Rx", value: controlledPrescriptions.length, meta: "Need countersign" },
    { id: "drafts", label: "Drafts waiting", value: draftPrescriptions.length, meta: "Sign before noon" },
    { id: "refills", label: "Refill approvals", value: refillApprovals.filter((req) => req.status === "Pending").length, meta: "Signature pending" }
  ];
  const doctorInboxHighlights = patientRequests.slice(0, 3);
  const patientsNeedingAttention = patients
    .filter((patient) => patient.status !== "Stable" || patient.adherence < 85)
    .slice(0, 3);
  const doctorTaskStack = [
    { id: "drafts", label: "Unsigned drafts", value: draftPrescriptions.length, meta: "Finalize for pharmacy" },
    { id: "approvals", label: "Pending approvals", value: refillApprovals.filter((req) => req.status === "Pending").length, meta: "Refills awaiting signature" },
    { id: "inbox", label: "Inbox requests", value: pendingPatientRequests.length, meta: "Patients awaiting response" }
  ];
  const clinicalActivity = prescriptionHistory.slice(0, 4);

  const upcomingAppointments = appointments.slice(0, 4);
  const nextAppointment = appointments[0];
  const doctorToplineStats = [
    {
      id: "total-users",
      label: "Total Patients",
      value: patients.length,
      sublabel: "+3 this week",
      icon: "👥",
      tone: "primary"
    },
    {
      id: "doctors-online",
      label: "Doctors Online",
      value: 12,
      sublabel: "Clinic collaborators",
      icon: "🩺",
      tone: "neutral"
    },
    {
      id: "appointments-today",
      label: "Appointments Today",
      value: appointments.length,
      sublabel: "Confirmed sessions",
      icon: "📅",
      tone: "success"
    },
    {
      id: "reports",
      label: "Reports",
      value: "12",
      sublabel: "New analytics",
      icon: "📈",
      tone: "warning"
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 ml-0 lg:ml-[240px]">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-6 mt-24 max-h-[calc(100vh-96px)]">
          {!user ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : !isValidTab ? (
            <div className="flex flex-col gap-6 items-center justify-center rounded-3xl border-2 border-dashed border-indigo-200 bg-white p-10 text-center shadow-sm">
              <div>
                <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest">Workspace idle</p>
                <h2 className="mt-3 text-3xl font-bold text-gray-900">Select a doctor workspace</h2>
                <p className="mt-2 text-gray-500 max-w-2xl">
                  Use the Doctor Workspace links in the sidebar to open Overview, Patients, Appointments, or Prescriptions.
                </p>
              </div>
              <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {tabs.map((tab) => (
                  <div key={tab.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-left">
                    <span className="text-2xl" aria-hidden>{tab.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{tab.label}</p>
                      <p className="text-xs text-gray-500">Available via sidebar</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {selectedTab === "overview" && (
                <>
                  <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                    {doctorToplineStats.map((stat) => (
                      <StatCard key={stat.id} {...stat} />
                    ))}
                  </section>

                  <div className="mb-8 space-y-4">
                    <section className="doctor-hero">
                      <div className="doctor-hero__glow" aria-hidden></div>
                      <div className="doctor-hero__left">
                        <p className="doctor-hero__eyebrow">Clinician Console</p>
                        <h1>{title}</h1>
                        <p className="doctor-hero__lead">{subtitle}</p>
                        <ul className="doctor-hero__meta">
                          <li>🕒 {formattedTime}</li>
                          <li>📍 Virtual ward</li>
                          <li>🔐 Secure e-prescribing</li>
                        </ul>
                      </div>
                      <div className="doctor-hero__right">
                        <article className="doctor-hero__card">
                          <p className="doctor-hero__card-label">Next patient</p>
                          <h3>{nextAppointment?.patientName || "No sessions"}</h3>
                          <p>{nextAppointment ? `${nextAppointment.date} · ${nextAppointment.time}` : "Your slate is clear"}</p>
                        </article>
                        <article className="doctor-hero__card doctor-hero__card--accent">
                          <p className="doctor-hero__card-label">Pending approvals</p>
                          <h3>{refillApprovals.filter((req) => req.status === "Pending").length}</h3>
                          <p>Refill signatures waiting</p>
                        </article>
                        <article className="doctor-hero__card doctor-hero__card--wide">
                          <p className="doctor-hero__card-label">Care focus</p>
                          <div className="doctor-hero__card-row">
                            <div>
                              <h3>{patientRequests[0]?.patientName || "Inbox is clear"}</h3>
                              <p>{patientRequests[0]?.requestType || "No pending requests"}</p>
                            </div>
                            <button type="button" onClick={() => setSearchParams({ tab: "overview" })}>Open inbox</button>
                          </div>
                        </article>
                      </div>
                    </section>

                      <div className="doctor-shortcuts">
                        {doctorActionShortcuts.map((action) => (
                          <button
                            key={action.id}
                            className="doctor-shortcut"
                            onClick={action.action}
                          >
                            <div className="doctor-shortcut__icon" aria-hidden>{action.icon}</div>
                            <div className="doctor-shortcut__body">
                              <p>{action.title}</p>
                              <span>{action.description}</span>
                            </div>
                            <span className="doctor-shortcut__cta">Launch</span>
                          </button>
                        ))}
                      </div>

                      <Card className="doctor-section-card p-0 overflow-hidden">
                      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                        <section className="p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">Patient inbox</h3>
                            <span className="text-xs text-gray-500">{pendingPatientRequests.length} pending</span>
                          </div>
                          <div className="space-y-3">
                            {doctorInboxHighlights.length ? (
                              doctorInboxHighlights.map((request) => (
                                <div key={request.id} className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                                  <p className="text-sm font-semibold text-gray-900">{request.patientName}</p>
                                  <p className="text-xs text-gray-500">{request.requestType} · {request.submittedAt}</p>
                                  <p className="text-xs text-gray-400">{request.message}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500">No new patient requests.</p>
                            )}
                          </div>
                        </section>
                        <section className="p-6 space-y-4 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">Compliance snapshot</h3>
                            <span className="text-xs text-gray-500">Live counts</span>
                          </div>
                          <div className="space-y-3">
                            {complianceCallouts.map((callout) => (
                              <div key={callout.id} className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{callout.label}</p>
                                  <p className="text-xs text-gray-500">{callout.meta}</p>
                                </div>
                                <span className="text-2xl font-bold text-indigo-600">{callout.value}</span>
                              </div>
                            ))}
                          </div>
                          <div className="rounded-xl border border-indigo-100 bg-white p-4 text-sm text-gray-600">
                            <p className="font-semibold text-gray-900 mb-1">Workflow reminder</p>
                            <p>Sign drafts before 12:00 to push to the pharmacy queue.</p>
                          </div>
                        </section>
                        <section className="p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">Day timeline</h3>
                            <span className="text-xs text-gray-500">{appointmentTimeline.length} sessions</span>
                          </div>
                          {appointmentTimeline.length ? (
                            <ol className="space-y-4">
                              {appointmentTimeline.map((slot) => (
                                <li key={slot.id} className="flex items-start gap-3">
                                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">{slot.patient}</p>
                                    <p className="text-xs text-gray-500">{slot.time}</p>
                                    <p className="text-xs text-gray-400">{slot.reason}</p>
                                  </div>
                                </li>
                              ))}
                            </ol>
                          ) : (
                            <p className="text-sm text-gray-500">No upcoming appointments.</p>
                          )}
                        </section>
                      </div>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card className="doctor-section-card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Purpose-built tools for clinicians</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {doctorFeatureCatalog.map((feature) => (
                        <div key={feature.title} className="flex items-start space-x-3 bg-indigo-50 rounded-lg p-3">
                          <span className="text-2xl" aria-hidden>{feature.icon}</span>
                          <div>
                            <p className="font-semibold text-gray-900">{feature.title}</p>
                            <p className="text-sm text-gray-600">{feature.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {doctorQuickInsights.map((tile) => (
                      <Card
                        key={tile.id}
                        className={`p-6 text-white border-none shadow-xl bg-gradient-to-br ${tile.gradient}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white/80">{tile.label}</p>
                            <p className="text-4xl font-bold">{tile.value}</p>
                            <p className="text-xs text-white/70 mt-1">{tile.detail}</p>
                          </div>
                          <div className="text-4xl">{tile.icon}</div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Card className="doctor-section-card p-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                      <section>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">Patients needing attention</h3>
                          <span className="text-xs text-gray-500">Clinical risk watch</span>
                        </div>
                        {patientsNeedingAttention.length ? (
                          <ul className="space-y-3">
                            {patientsNeedingAttention.map((patient) => (
                              <li key={patient.id} className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold text-gray-900">{patient.name}</p>
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(patient.status)}`}>
                                    {patient.status}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">Adherence {patient.adherence}% · Last visit {patient.lastVisit}</p>
                                <p className="text-xs text-gray-500">Current meds: {patient.medications.join(', ')}</p>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">All monitored patients are stable.</p>
                        )}
                      </section>
                      <section>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">Doctor task stack</h3>
                          <span className="text-xs text-gray-500">Prioritize your day</span>
                        </div>
                        <div className="space-y-3">
                          {doctorTaskStack.map((task) => (
                            <div key={task.id} className="rounded-2xl bg-gray-50 p-4 flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{task.label}</p>
                                <p className="text-xs text-gray-500">{task.meta}</p>
                              </div>
                              <span className="text-3xl font-bold text-indigo-600">{task.value}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  </Card>

                  <Card className="doctor-section-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Pending Patient Requests</h3>
                      <span className="text-sm text-gray-500">Approve or reject medicine asks</span>
                    </div>
                    <div className="space-y-4">
                      {patientRequests.map((request) => (
                        <div key={request.id} className="flex flex-col md:flex-row md:items-center md:justify-between border border-gray-200 rounded-lg p-4">
                          <div className="mb-3 md:mb-0">
                            <p className="font-medium text-gray-900">{request.patientName}</p>
                            <p className="text-sm text-gray-500">{request.requestType} · {request.submittedAt}</p>
                            <p className="text-xs text-gray-400">{request.message}</p>
                          </div>
                          <div className="flex space-x-2">
                            {request.status === 'Pending' ? (
                              <>
                                <Button size="sm" variant="outline" onClick={() => handlePatientRequest(request.id, 'Rejected')}>Reject</Button>
                                <Button size="sm" onClick={() => handlePatientRequest(request.id, 'Approved')}>Approve</Button>
                              </>
                            ) : (
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${request.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {request.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Recent Activity */}
                  <Card className="doctor-section-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Clinical activity log</h3>
                      <span className="text-sm text-gray-500">Updated automatically</span>
                    </div>
                    {clinicalActivity.length ? (
                      <ol className="space-y-4">
                        {clinicalActivity.map((entry) => (
                          <li key={entry.id} className="flex items-start space-x-3">
                            <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500"></span>
                            <div>
                              <p className="font-medium text-gray-900">{entry.action}</p>
                              <p className="text-xs text-gray-500">{entry.actor}</p>
                              <p className="text-[11px] text-gray-400">{entry.timestamp}</p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-sm text-gray-500">No recent clinical actions logged.</p>
                    )}
                  </Card>
                </div>
                </>
              )}

              {/* Patients Tab */}
              {selectedTab === "patients" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
                    <Button>Add New Patient</Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {patients.map((patient) => (
                      <Card key={patient.id} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                            <p className="text-sm text-gray-600">Age: {patient.age}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                            {patient.status}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Email:</span> {patient.email}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Phone:</span> {patient.phone}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Last Visit:</span> {patient.lastVisit}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Adherence:</span>
                            <span className={`ml-1 font-medium ${getAdherenceColor(patient.adherence)}`}>
                              {patient.adherence}%
                            </span>
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">History:</span> {patient.history.join(', ')}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Current meds:</span> {patient.medications.join(', ')}
                          </p>
                        </div>

                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            View Details
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            Start Consultation
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Appointments Tab */}
              {selectedTab === "appointments" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Appointment Schedule</h2>
                    <Button>Schedule New Appointment</Button>
                  </div>

                  <Card className="doctor-section-card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule timeline</h3>
                    <ol className="space-y-4">
                      {appointments.map((appointment) => (
                        <li key={`timeline-${appointment.id}`} className="flex items-start gap-3">
                          <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500"></span>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{appointment.time}</p>
                            <p className="text-xs text-gray-500">{appointment.date}</p>
                            <p className="text-xs text-gray-400">{appointment.patientName} · {appointment.reason}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </Card>

                  <Card className="doctor-section-card p-6">
                    <div className="space-y-4">
                      {appointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 font-medium">
                                {appointment.patientName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
                              <p className="text-sm text-gray-600">{appointment.reason}</p>
                              <p className="text-xs text-gray-500">{appointment.notes}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{appointment.date}</p>
                            <p className="text-sm text-gray-600">{appointment.time}</p>
                          </div>
                          <div className="flex flex-col space-y-2 w-full max-w-xs">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">Reschedule</Button>
                              <Button size="sm">Start</Button>
                            </div>
                            <textarea
                              className="w-full border border-gray-200 rounded-md px-2 py-1 text-xs"
                              placeholder="Consultation notes (optional)"
                              value={consultationNotes[appointment.id] || ''}
                              onChange={(e) => updateConsultationNote(appointment.id, e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* Prescriptions Tab */}
              {selectedTab === "prescriptions" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="doctor-section-card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">E-Prescription Composer</h2>
                          <p className="text-sm text-gray-500">Attach diagnosis, dosage, refills, and digital signature</p>
                        </div>
                        <span className="text-xs font-medium text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">Legally binding</span>
                      </div>
                      <form className="space-y-4" onSubmit={handleCreatePrescription}>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                          <input
                            className="w-full border border-gray-200 rounded-lg px-3 py-2"
                            value={newPrescription.patientName}
                            onChange={(e) => handlePrescriptionFieldChange("patientName", e.target.value)}
                            placeholder="e.g. John Doe"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Medication</label>
                            <input
                              className="w-full border border-gray-200 rounded-lg px-3 py-2"
                              value={newPrescription.medication}
                              onChange={(e) => handlePrescriptionFieldChange("medication", e.target.value)}
                              placeholder="Drug name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                            <input
                              className="w-full border border-gray-200 rounded-lg px-3 py-2"
                              value={newPrescription.dosage}
                              onChange={(e) => handlePrescriptionFieldChange("dosage", e.target.value)}
                              placeholder="500 mg"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                            <select
                              className="w-full border border-gray-200 rounded-lg px-3 py-2"
                              value={newPrescription.route}
                              onChange={(e) => handlePrescriptionFieldChange("route", e.target.value)}
                            >
                              <option>Oral</option>
                              <option>Topical</option>
                              <option>Injection</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                            <input
                              className="w-full border border-gray-200 rounded-lg px-3 py-2"
                              value={newPrescription.duration}
                              onChange={(e) => handlePrescriptionFieldChange("duration", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Refills</label>
                            <input
                              type="number"
                              min={0}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2"
                              value={newPrescription.refills}
                              onChange={(e) => handlePrescriptionFieldChange("refills", Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis / Notes</label>
                          <textarea
                            className="w-full border border-gray-200 rounded-lg px-3 py-2"
                            rows={3}
                            value={newPrescription.diagnosis}
                            onChange={(e) => handlePrescriptionFieldChange("diagnosis", e.target.value)}
                            placeholder="Clinical justification, ICD code, follow-up plan"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="flex items-center space-x-2 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={newPrescription.controlled}
                              onChange={(e) => handlePrescriptionFieldChange("controlled", e.target.checked)}
                            />
                            <span>Controlled substance (Will require countersign)</span>
                          </label>
                          <Button type="submit">Generate Rx</Button>
                        </div>
                      </form>
                    </Card>

                    <div className="space-y-6">
                      <Card className="doctor-section-card p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Uploaded Prescriptions</h3>
                          <span className="text-xs text-gray-500">Verify patient files</span>
                        </div>
                        <div className="space-y-4">
                          {uploadedPrescriptions.map((doc) => (
                            <div key={doc.id} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{doc.patientName}</p>
                                <p className="text-sm text-gray-500">{doc.fileType} · Uploaded {doc.uploadedAt}</p>
                                <p className="text-xs text-gray-400">{doc.notes}</p>
                              </div>
                              <Button size="sm" variant={doc.reviewed ? 'outline' : 'primary'} onClick={() => toggleUploadedPrescription(doc.id)}>
                                {doc.reviewed ? 'Mark as Pending' : 'Mark Reviewed'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </Card>
                      <Card className="doctor-section-card p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Interaction & Compliance Flags</h3>
                          <span className="text-xs text-indigo-700">
                            {interactionFlags.length ? `${interactionFlags.length} warning(s)` : "Clean"}
                          </span>
                        </div>
                        {interactionFlags.length === 0 ? (
                          <p className="text-sm text-gray-500">No conflicts detected for current draft.</p>
                        ) : (
                          <ul className="space-y-3">
                            {interactionFlags.map((flag) => (
                              <li key={flag.id} className="border border-yellow-200 bg-yellow-50 p-3 rounded-lg">
                                <p className="font-medium text-yellow-700">{flag.title}</p>
                                <p className="text-sm text-yellow-700">{flag.detail}</p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </Card>

                      <Card className="doctor-section-card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Regulatory Checklist</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• DEA / national license auto-appended to digital signature</li>
                          <li>• PDMP sync queued for controlled prescriptions</li>
                          <li>• Countersign reminder enabled when controlled substance toggle is on</li>
                          <li>• Consultation notes archived with each issued script</li>
                        </ul>
                      </Card>
                    </div>
                  </div>

                  <Card className="doctor-section-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Prescription Lifecycle</h3>
                      <p className="text-sm text-gray-500">Draft → Signed → Dispensed</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['Draft', 'Signed', 'Dispensed'].map((status) => (
                        <div key={status} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-800">{status}</h4>
                            <span className="text-xs text-gray-500">{prescriptions.filter((rx) => rx.status === status).length}</span>
                          </div>
                          <div className="space-y-3">
                            {prescriptions.filter((rx) => rx.status === status).map((rx) => (
                              <div key={rx.id} className="bg-white rounded-lg p-3 shadow-sm">
                                <p className="text-sm font-medium text-gray-900">{rx.medication}</p>
                                <p className="text-xs text-gray-500">{rx.patientName} · {rx.dosage}</p>
                                <p className="text-xs text-gray-400 mb-2">{rx.lastAction}</p>
                                {status !== 'Dispensed' && (
                                  <Button size="sm" variant="outline" onClick={() => advancePrescriptionStatus(rx.id)}>
                                    Move to {status === 'Draft' ? 'Signed' : 'Dispensed'}
                                  </Button>
                                )}
                              </div>
                            ))}
                            {prescriptions.filter((rx) => rx.status === status).length === 0 && (
                              <p className="text-xs text-gray-400">No records</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="doctor-section-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Refill Approvals</h3>
                      <span className="text-sm text-gray-500">Supports RBAC — doctor-only action</span>
                    </div>
                    <div className="space-y-4">
                      {refillApprovals.map((request) => (
                        <div key={request.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
                          <div>
                            <p className="font-medium text-gray-900">{request.patientName}</p>
                            <p className="text-sm text-gray-500">{request.medication} · requested {request.requestedOn}</p>
                            <p className="text-xs text-gray-400">Last visit {request.lastVisit}</p>
                          </div>
                          <div className="flex space-x-2">
                            {request.status === 'Pending' ? (
                              <>
                                <Button size="sm" variant="outline" onClick={() => handleRefillDecision(request.id, false)}>Decline</Button>
                                <Button size="sm" onClick={() => handleRefillDecision(request.id, true)}>Approve</Button>
                              </>
                            ) : (
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${request.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {request.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="doctor-section-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Prescription History Ledger</h3>
                      <span className="text-sm text-gray-500">Complete audit trail</span>
                    </div>
                    <ul className="space-y-3">
                      {prescriptionHistory.map((entry) => (
                        <li key={entry.id} className="flex items-start justify-between border border-gray-100 rounded-lg p-3 bg-gray-50">
                          <div>
                            <p className="font-medium text-gray-900">{entry.action}</p>
                            <p className="text-xs text-gray-500">{entry.actor}</p>
                          </div>
                          <span className="text-xs text-gray-400">{entry.timestamp}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              )}

              {/* Settings Tab */}
              {selectedTab === "settings" && (
                <div className="space-y-6">
                  <Settings />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;