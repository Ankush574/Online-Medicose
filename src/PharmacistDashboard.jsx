import React, { useState, useContext, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import Card from "./components/Card";
import Button from "./components/Button";
import StatCard from "./components/StatCard";
import Settings from "./Settings";
import "./PharmacistDashboard.css";

const PharmacistDashboard = () => {
  const { user } = useContext(AuthContext);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [profile, setProfile] = useState(null);
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      patientName: "John Doe",
      medication: "Amoxicillin",
      dosage: "500mg",
      quantity: 30,
      status: "Pending",
      date: "2024-01-10"
    },
    {
      id: 2,
      patientName: "Jane Smith",
      medication: "Paracetamol",
      dosage: "650mg",
      quantity: 20,
      status: "Filled",
      date: "2024-01-08"
    },
    {
      id: 3,
      patientName: "Robert Wilson",
      medication: "Vitamin D",
      dosage: "1000 IU",
      quantity: 60,
      status: "Pending",
      date: "2024-01-12"
    }
  ]);
  const [verificationQueue, setVerificationQueue] = useState([
    {
      id: "RX-1205",
      patientName: "Jane Smith",
      medication: "Atorvastatin",
      license: "DEA-55221",
      prescriber: "Dr. Anika Rao",
      status: "Awaiting Verification",
      issued: "2026-01-28"
    },
    {
      id: "RX-1210",
      patientName: "Robert Wilson",
      medication: "Tramadol",
      license: "DEA-78112",
      prescriber: "Dr. Emily Stone",
      status: "Flagged",
      issued: "2026-01-29"
    }
  ]);
  const [supplyOrders, setSupplyOrders] = useState([
    {
      id: "PO-441",
      vendor: "Global Pharma",
      items: "Amoxicillin (200 units)",
      eta: "Feb 02",
      status: "Ordered"
    },
    {
      id: "PO-442",
      vendor: "Sunrise Labs",
      items: "Paracetamol (500 units)",
      eta: "Jan 31",
      status: "In Transit"
    }
  ]);
  const [auditLog, setAuditLog] = useState([
    {
      id: "LOG-901",
      event: "Temperature log uploaded",
      timestamp: "Today, 09:10"
    },
    {
      id: "LOG-905",
      event: "Controlled drug count verified",
      timestamp: "Yesterday, 18:40"
    }
  ]);

  const [inventory, setInventory] = useState([
    {
      id: 1,
      name: "Amoxicillin",
      stock: 150,
      lowStock: 50,
      expiry: "2024-06-15"
    },
    {
      id: 2,
      name: "Paracetamol",
      stock: 200,
      lowStock: 30,
      expiry: "2024-08-20"
    },
    {
      id: 3,
      name: "Vitamin D",
      stock: 45,
      lowStock: 20,
      expiry: "2024-04-10"
    }
  ]);

  const [refillRequests, setRefillRequests] = useState([
    {
      id: 1,
      patientName: "John Doe",
      medication: "Amoxicillin",
      requestedDate: "2024-01-10",
      status: "Pending"
    },
    {
      id: 2,
      patientName: "Jane Smith",
      medication: "Paracetamol",
      requestedDate: "2024-01-09",
      status: "Approved"
    }
  ]);

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTab = searchParams.get("tab") || "overview";

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


  const getStatusColor = (status) => {
    switch (status) {
      case "Filled": return "text-green-600 bg-green-100";
      case "Pending": return "text-yellow-600 bg-yellow-100";
      case "Approved": return "text-blue-600 bg-blue-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStockStatus = (stock, lowStock) => {
    if (stock <= lowStock) return { status: "Low Stock", color: "text-red-600 bg-red-100" };
    if (stock <= lowStock * 2) return { status: "Medium", color: "text-yellow-600 bg-yellow-100" };
    return { status: "Good", color: "text-green-600 bg-green-100" };
  };

  const getDaysUntilDate = (dateString) => {
    const today = new Date();
    const target = new Date(dateString);
    const diff = target.getTime() - today.getTime();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  };

  const handleVerificationOutcome = (rxId, outcome) => {
    setVerificationQueue((prev) =>
      prev.map((item) =>
        item.id === rxId ? { ...item, status: outcome === 'verify' ? 'Verified' : 'Escalated' } : item
      )
    );
    setAuditLog((prev) => [
      { id: `LOG-${Math.floor(Math.random() * 900)}`, event: `${rxId} ${outcome === 'verify' ? 'verified' : 'escalated'} by pharmacist`, timestamp: new Date().toLocaleString() },
      ...prev
    ]);
  };

  const handlePrescriptionAction = (id, action) => {
    setPrescriptions((prev) =>
      prev.map((rx) =>
        rx.id === id
          ? { ...rx, status: action === 'fill' ? 'Filled' : 'Rejected' }
          : rx
      )
    );
    setAuditLog((prev) => [
      { id: `LOG-${Math.floor(Math.random() * 900)}`, event: `${action === 'fill' ? 'Dispensed' : 'Rejected'} ${id}`, timestamp: new Date().toLocaleString() },
      ...prev
    ]);
  };

  const advanceSupplyOrder = (orderId) => {
    const flow = ['Ordered', 'In Transit', 'Received'];
    setSupplyOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const next = flow[Math.min(flow.indexOf(order.status) + 1, flow.length - 1)];
        return { ...order, status: next };
      })
    );
  };

  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { greeting: "Good Morning", icon: "☀️" };
    if (hour < 17) return { greeting: "Good Afternoon", icon: "☀️" };
    return { greeting: "Good Evening", icon: "🌙" };
  };

  const { greeting, icon } = getTimeBasedGreeting();

  const { title, subtitle } = {
    title: `${greeting}, Pharmacist ${profile?.name || user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Pharmacist'} ${icon}`,
    subtitle: "Manage prescriptions, inventory, and medication refills"
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "prescriptions", label: "Prescriptions", icon: "💊" },
    { id: "inventory", label: "Inventory", icon: "📦" },
    { id: "refills", label: "Refill Requests", icon: "🔄" },
    { id: "settings", label: "Settings", icon: "⚙️" }
  ];
  const isValidTab = tabs.some((tab) => tab.id === selectedTab);
  const pharmacistFeatureCatalog = [
    {
      title: "Verification Queue",
      detail: "Check DEA/license data before dispensing.",
      icon: "🛡️"
    },
    {
      title: "Dispense Workflow",
      detail: "Mark prescriptions filled, rejected, or escalate.",
      icon: "⚙️"
    },
    {
      title: "Inventory Guard",
      detail: "Batch + expiry audits with low-stock alerts.",
      icon: "📦"
    },
    {
      title: "Supply Chain",
      detail: "Track purchase orders from vendor to shelf.",
      icon: "🚚"
    }
  ];

  const pendingPrescriptions = prescriptions.filter((p) => p.status === "Pending");
  const lowInventoryItems = inventory.filter((item) => item.stock <= item.lowStock);
  const flaggedVerifications = verificationQueue.filter(
    (item) => item.status === "Flagged" || item.status === "Awaiting Verification"
  );
  const expiringSoon = inventory.filter((item) => getDaysUntilDate(item.expiry) <= 45);
  const controlledQueue = prescriptions.filter((rx) => rx.controlled);
  const refillStatusCounts = refillRequests.reduce(
    (acc, request) => {
      acc[request.status] = (acc[request.status] || 0) + 1;
      return acc;
    },
    {}
  );

  const pharmacistVitals = [
    { id: "pending-rx", label: "Pending RX", value: pendingPrescriptions.length, meta: "Need filling" },
    { id: "verifications", label: "Verification queue", value: flaggedVerifications.length, meta: "License checks" },
    { id: "low-stock", label: "Low stock", value: lowInventoryItems.length, meta: "Under threshold" },
    { id: "expiring", label: "Expiring soon", value: expiringSoon.length, meta: "< 45 days" }
  ];

  const pharmacistHeroActions = [
    {
      id: "dispense",
      label: "New dispense",
      variant: "primary",
      onClick: () => setSearchParams({ tab: "prescriptions" })
    },
    {
      id: "inventory",
      label: "Update inventory",
      onClick: () => setSearchParams({ tab: "inventory" })
    },
    {
      id: "refill",
      label: "Inbox refills",
      onClick: () => setSearchParams({ tab: "refills" })
    }
  ];

  const pharmacistActionShortcuts = [
    {
      id: "verify",
      title: "Verification queue",
      description: "Confirm DEA + prescriber before dispense.",
      icon: "🛡️",
      metric: `${flaggedVerifications.length} flagged`,
      onClick: () => setSearchParams({ tab: "prescriptions" })
    },
    {
      id: "cold-chain",
      title: "Cold chain monitor",
      description: "Log fridge temps & upload audits.",
      icon: "🌡️",
      metric: `${auditLog.length} updates`,
      onClick: () => setSearchParams({ tab: "inventory" })
    },
    {
      id: "controlled",
      title: "Controlled Rx board",
      description: "Track countersign + escalation.",
      icon: "⚖️",
      metric: `${controlledQueue.length} active`,
      onClick: () => setSearchParams({ tab: "prescriptions" })
    }
  ];

  const supplyTimeline = supplyOrders.map((order) => ({
    id: order.id,
    vendor: order.vendor,
    status: order.status,
    eta: order.eta
  }));

  const complianceTimeline = auditLog.map((entry) => ({
    id: entry.id,
    event: entry.event,
    timestamp: entry.timestamp
  }));

  const refillStatusSummary = [
    { id: "pending", label: "Pending", value: refillStatusCounts.Pending || 0 },
    { id: "approved", label: "Approved", value: refillStatusCounts.Approved || 0 },
    { id: "rejected", label: "Rejected", value: refillStatusCounts.Rejected || 0 }
  ];

  const pendingRefills = refillRequests.filter((request) => request.status === "Pending").length;
  const pipelineMetrics = [
    {
      id: "dispense-queue",
      label: "Dispense queue",
      value: pendingPrescriptions.length,
      meta: "Scripts awaiting fill"
    },
    {
      id: "verification",
      label: "License verification",
      value: flaggedVerifications.length,
      meta: "DEA + prescriber checks"
    },
    {
      id: "refill",
      label: "Refill approvals",
      value: pendingRefills,
      meta: "Patients waiting on pharmacist"
    }
  ];
  const pipelineValues = pipelineMetrics.map((metric) => metric.value);
  const pipelineMax = pipelineValues.length ? Math.max(1, ...pipelineValues) : 1;

  const environmentVitals = [
    {
      id: "expiring",
      label: "Expiring lots",
      value: expiringSoon.length,
      meta: "Pull forward <45 days",
      gradient: "from-amber-500 via-orange-500 to-yellow-500"
    },
    {
      id: "orders",
      label: "Orders in transit",
      value: supplyOrders.filter((order) => order.status !== "Received").length,
      meta: "POs moving through vendors",
      gradient: "from-emerald-500 via-green-500 to-teal-500"
    },
    {
      id: "audits",
      label: "Compliance events",
      value: auditLog.length,
      meta: "Logged last 24h",
      gradient: "from-sky-500 via-indigo-500 to-purple-500"
    }
  ];

  const opsTimeline = [
    ...pendingPrescriptions.map((rx) => ({
      id: `pending-${rx.id}`,
      title: `Pending fill for ${rx.patientName}`,
      detail: `${rx.medication} · ${rx.dosage}`,
      timestamp: rx.date
    })),
    ...verificationQueue.map((item) => ({
      id: `verify-${item.id}`,
      title: `${item.patientName} · ${item.medication}`,
      detail: `${item.status} — ${item.prescriber}`,
      timestamp: `Issued ${item.issued}`
    })),
    ...auditLog.map((entry) => ({
      id: entry.id,
      title: entry.event,
      detail: "Compliance update",
      timestamp: entry.timestamp
    }))
  ].slice(0, 6);

  const refillSpotlight = refillRequests.slice(0, 3);
  const pharmacistToplineStats = [
    {
      id: "total-users",
      label: "Total Users",
      value: prescriptions.length + refillRequests.length,
      sublabel: "Patients touched",
      icon: "👥",
      tone: "primary"
    },
    {
      id: "doctors-online",
      label: "Doctors Online",
      value: 8,
      sublabel: "Prescribers active",
      icon: "🩺",
      tone: "neutral"
    },
    {
      id: "appointments-today",
      label: "Appointments Today",
      value: pendingPrescriptions.length,
      sublabel: "Scripts queued",
      icon: "📅",
      tone: "success"
    },
    {
      id: "reports",
      label: "Reports",
      value: "4",
      sublabel: "New compliance notes",
      icon: "📊",
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
            <div className="flex flex-col gap-6 items-center justify-center rounded-3xl border-2 border-dashed border-emerald-200 bg-white p-10 text-center shadow-sm">
              <div>
                <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest">Console idle</p>
                <h2 className="mt-3 text-3xl font-bold text-gray-900">Select a pharmacist console</h2>
                <p className="mt-2 text-gray-500 max-w-2xl">
                  Use the Pharmacist Console links in the sidebar to open Overview, Prescriptions, Inventory, or Refill Requests.
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
                    {pharmacistToplineStats.map((stat) => (
                      <StatCard key={stat.id} {...stat} />
                    ))}
                  </section>

                  <div className="mb-8 space-y-6">
                    <section className="pharmacist-hero">
                      <div className="pharmacist-hero__glow" aria-hidden></div>
                      <div className="pharmacist-hero__left">
                        <p className="pharmacist-hero__eyebrow">Dispensary cockpit</p>
                        <h1>{title}</h1>
                        <p>{subtitle}</p>
                        <div className="pharmacist-hero__actions">
                          {pharmacistHeroActions.map((action) => (
                            <button
                              key={action.id}
                              type="button"
                              className={action.variant === 'primary' ? 'primary' : ''}
                              onClick={action.onClick}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="pharmacist-hero__right">
                        <div className="pharmacist-hero__tiles">
                          {pharmacistVitals.map((stat) => (
                            <div key={stat.id} className="pharmacist-hero__tile">
                              <p className="label">{stat.label}</p>
                              <p className="num">{stat.value}</p>
                              <p className="meta">{stat.meta}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    <div className="pharmacist-shortcuts">
                      {pharmacistActionShortcuts.map((shortcut) => (
                        <Card
                          key={shortcut.id}
                          className="pharmacist-shortcut"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-2xl" aria-hidden>
                              {shortcut.icon}
                            </span>
                            <span className="text-xs font-semibold text-emerald-600">{shortcut.metric}</span>
                          </div>
                          <p className="mt-3 text-lg font-semibold text-gray-900">{shortcut.title}</p>
                          <p className="text-sm text-gray-500">{shortcut.description}</p>
                          <button
                            type="button"
                            className="pharmacist-shortcut__cta"
                            onClick={shortcut.onClick}
                          >
                            Go to board →
                          </button>
                        </Card>
                      ))}
                    </div>

                    <Card className="pharmacist-section-card p-0 overflow-hidden">
                      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                        <section className="p-6 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">Verification queue</h3>
                            <span className="text-xs text-gray-500">{flaggedVerifications.length} awaiting</span>
                          </div>
                          <div className="space-y-3">
                            {verificationQueue.slice(0, 3).map((item) => (
                              <div key={item.id} className="rounded-lg border border-emerald-100 p-3 bg-emerald-50/40">
                                <p className="text-sm font-semibold text-gray-900">{item.patientName}</p>
                                <p className="text-xs text-gray-500">{item.medication} · {item.id}</p>
                                <span className="text-[11px] font-semibold text-amber-700">{item.status}</span>
                              </div>
                            ))}
                          </div>
                        </section>
                        <section className="p-6 space-y-3 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">Supply timeline</h3>
                            <span className="text-xs text-gray-500">{supplyTimeline.length} orders</span>
                          </div>
                          <ul className="space-y-3">
                            {supplyTimeline.map((order) => (
                              <li key={order.id} className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{order.id} · {order.vendor}</p>
                                  <p className="text-xs text-gray-500">ETA {order.eta}</p>
                                </div>
                                <span className="text-xs font-semibold text-gray-600">{order.status}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                        <section className="p-6 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">Compliance log</h3>
                            <span className="text-xs text-gray-500">{complianceTimeline.length} entries</span>
                          </div>
                          <ul className="space-y-2 text-sm text-gray-600">
                            {complianceTimeline.map((entry) => (
                              <li key={entry.id} className="flex items-center justify-between">
                                <span>{entry.event}</span>
                                <span className="text-xs text-gray-400">{entry.timestamp}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      </div>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card className="pharmacist-section-card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Dispensary control center</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pharmacistFeatureCatalog.map((feature) => (
                        <div key={feature.title} className="flex items-start space-x-3 bg-emerald-50 rounded-lg p-3">
                          <span className="text-2xl" aria-hidden>{feature.icon}</span>
                          <div>
                            <p className="font-semibold text-gray-900">{feature.title}</p>
                            <p className="text-sm text-gray-600">{feature.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="pharmacist-section-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Operational pipeline</h3>
                        <p className="text-sm text-gray-500">Live workload across verification, dispensing, and refills</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                        {pipelineMetrics.reduce((sum, metric) => sum + metric.value, 0)} tasks
                      </span>
                    </div>
                    <ul className="space-y-5">
                      {pipelineMetrics.map((metric) => (
                        <li key={metric.id}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-700">{metric.label}</span>
                            <span className="text-gray-900 font-semibold">{metric.value}</span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500"
                              style={{ width: `${pipelineMax ? Math.round((metric.value / pipelineMax) * 100) : 0}%` }}
                            ></div>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">{metric.meta}</p>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {environmentVitals.map((vital) => (
                      <Card
                        key={vital.id}
                        className={`p-4 border-none shadow-md text-white bg-gradient-to-br ${vital.gradient}`}
                      >
                        <p className="text-xs uppercase tracking-wide text-white/80">{vital.label}</p>
                        <p className="text-4xl font-bold">{vital.value}</p>
                        <p className="text-sm text-white/80">{vital.meta}</p>
                      </Card>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Operations timeline</h3>
                        <span className="text-xs text-gray-500">Live log</span>
                      </div>
                      {opsTimeline.length ? (
                        <ol className="space-y-4">
                          {opsTimeline.map((entry) => (
                            <li key={entry.id} className="flex items-start space-x-3">
                              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{entry.title}</p>
                                <p className="text-xs text-gray-500">{entry.detail}</p>
                                <p className="text-[11px] text-gray-400">{entry.timestamp}</p>
                              </div>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-sm text-gray-500">No live activity right now.</p>
                      )}
                    </Card>

                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Refill spotlight</h3>
                        <span className="text-xs text-gray-500">{pendingRefills} pending</span>
                      </div>
                      <div className="space-y-4">
                        {refillSpotlight.map((request) => (
                          <div key={`spotlight-${request.id}`} className="rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-gray-900">{request.patientName}</p>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                                {request.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{request.medication}</p>
                            <p className="text-xs text-gray-400">Requested {request.requestedDate}</p>
                          </div>
                        ))}
                        {refillSpotlight.length === 0 && (
                          <p className="text-sm text-gray-500">No refill requests at the moment.</p>
                        )}
                      </div>
                    </Card>
                  </div>
                  </div>
                </>
              )}

              {/* Prescriptions Tab */}
              {selectedTab === "prescriptions" && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Prescription Management</h2>
                      <p className="text-sm text-gray-500">Queue, verify, and fill active scripts</p>
                    </div>
                    <Button>Process New Prescription</Button>
                  </div>

                  <Card className="pharmacist-section-card p-6">
                    <div className="space-y-4">
                      {prescriptions.length === 0 ? (
                        <p className="text-sm text-gray-500">No prescriptions queued right now.</p>
                      ) : (
                        prescriptions.map((prescription) => (
                          <div
                            key={prescription.id}
                            className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 md:flex-row md:items-center md:justify-between"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                                <span className="text-indigo-600 font-medium">
                                  {prescription.patientName.split(' ').map((n) => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{prescription.patientName}</h4>
                                <p className="text-sm text-gray-600">
                                  {prescription.medication} · {prescription.dosage} (Qty: {prescription.quantity})
                                </p>
                                <p className="text-xs text-gray-500">Date: {prescription.date}</p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-3 text-right md:flex-row md:items-center md:gap-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                                {prescription.status}
                              </span>
                              {prescription.status === 'Pending' && (
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="outline" onClick={() => handlePrescriptionAction(prescription.id, 'reject')}>
                                    Reject
                                  </Button>
                                  <Button size="sm" onClick={() => handlePrescriptionAction(prescription.id, 'fill')}>
                                    Fill
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <Card className="pharmacist-section-card p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Verification Checklist</h3>
                        <span className="text-sm text-gray-500">Legal RBAC step</span>
                      </div>
                      <div className="space-y-4">
                        {verificationQueue.length === 0 ? (
                          <p className="text-sm text-gray-500">All prescriptions verified.</p>
                        ) : (
                          verificationQueue.map((item) => (
                            <div key={item.id} className="rounded-lg border border-gray-200 p-4">
                              <p className="font-medium text-gray-900">{item.patientName}</p>
                              <p className="text-sm text-gray-500">{item.medication} · {item.id}</p>
                              <p className="text-xs text-gray-400">Prescriber: {item.prescriber} ({item.license})</p>
                              <p className="mb-2 text-xs text-gray-400">Issued {item.issued}</p>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleVerificationOutcome(item.id, 'escalate')}>
                                  Escalate
                                </Button>
                                <Button size="sm" onClick={() => handleVerificationOutcome(item.id, 'verify')}>
                                  Verify
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </Card>

                    <Card className="pharmacist-section-card p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Chain of Custody</h3>
                        <span className="text-xs text-gray-500">Audit ready</span>
                      </div>
                      <ul className="space-y-3 text-sm text-gray-600">
                        {auditLog.length === 0 ? (
                          <li className="text-gray-500">No recent audit events.</li>
                        ) : (
                          auditLog.map((entry) => (
                            <li
                              key={entry.id}
                              className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-none last:pb-0"
                            >
                              <span>{entry.event}</span>
                              <span className="text-gray-400">{entry.timestamp}</span>
                            </li>
                          ))
                        )}
                      </ul>
                    </Card>
                  </div>
                </div>
              )}

              {/* Inventory Tab */}
              {selectedTab === "inventory" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
                    <Button>Add New Item</Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inventory.map((item) => {
                      const stockInfo = getStockStatus(item.stock, item.lowStock);
                      return (
                        <Card key={item.id} className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                              <p className="text-sm text-gray-600">Expiry: {item.expiry}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockInfo.color}`}>
                              {stockInfo.status}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Current Stock:</span>
                              <span className="font-medium">{item.stock} units</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Low Stock Threshold:</span>
                              <span className="font-medium">{item.lowStock} units</span>
                            </div>
                          </div>

                          <div className="mt-4 flex space-x-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              Update Stock
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              View Details
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>

                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Supply Orders</h3>
                      <span className="text-sm text-gray-500">Upstream replenishment</span>
                    </div>
                    <div className="space-y-3">
                      {supplyOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                          <div>
                            <p className="font-medium text-gray-900">{order.id} · {order.vendor}</p>
                            <p className="text-sm text-gray-500">{order.items}</p>
                            <p className="text-xs text-gray-400">ETA {order.eta}</p>
                          </div>
                          {order.status !== 'Received' ? (
                            <Button size="sm" onClick={() => advanceSupplyOrder(order.id)}>
                              Move to next ({order.status})
                            </Button>
                          ) : (
                            <span className="text-green-600 text-xs font-semibold">Received</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>

                  {expiringSoon.length > 0 && (
                    <Card className="pharmacist-section-card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Expiring soon</h3>
                        <span className="text-sm text-gray-500">{expiringSoon.length} at risk</span>
                      </div>
                      <div className="space-y-3">
                        {expiringSoon.map((item) => (
                          <div key={`expiring-${item.id}`} className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-gray-900">{item.name}</p>
                              <span className="text-xs font-semibold text-amber-700">
                                {getDaysUntilDate(item.expiry)} days
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">Expiry {item.expiry} · Stock {item.stock} units</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* Refills Tab */}
              {selectedTab === "refills" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Refill Requests</h2>
                    <Button>Process All Pending</Button>
                  </div>

                  <Card className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {refillStatusSummary.map((status) => (
                        <div key={status.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center">
                          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{status.label}</p>
                          <p className="text-3xl font-bold text-gray-900">{status.value}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="space-y-4">
                      {refillRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 font-medium">
                                {request.patientName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{request.patientName}</h4>
                              <p className="text-sm text-gray-600">{request.medication}</p>
                              <p className="text-xs text-gray-500">Requested: {request.requestedDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                            {request.status === 'Pending' && (
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">Reject</Button>
                                <Button size="sm">Approve</Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
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

export default PharmacistDashboard;