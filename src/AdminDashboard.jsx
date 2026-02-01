import React, { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import Card from "./components/Card";
import Button from "./components/Button";
import StatCard from "./components/StatCard";
import Settings from "./Settings";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [profile, setProfile] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTab = searchParams.get("tab") || "overview";

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user && user.id) {
      try {
        const profileData = JSON.parse(localStorage.getItem(`profile_${user.id}`) || "{}");
        setProfile(profileData);
      } catch (error) {
        console.error("Error loading profile:", error);
        setProfile({});
      }
    }
  }, [user]);

  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { greeting: "Good Morning", icon: "☀️" };
    if (hour < 17) return { greeting: "Good Afternoon", icon: "☀️" };
    return { greeting: "Good Evening", icon: "🌙" };
  };

  const { greeting, icon } = getTimeBasedGreeting();

  const title = `${greeting}, Admin ${
    profile?.name || user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "User"
  } ${icon}`;
  const subtitle = "Operate the MediCose platform across patients, clinicians, and pharmacies.";

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "users", label: "User Management", icon: "👥" },
    { id: "approvals", label: "Approvals", icon: "✅" },
    { id: "orders", label: "Orders & Payments", icon: "💳" },
    { id: "analytics", label: "Analytics & Reports", icon: "📈" },
    { id: "settings", label: "Platform Settings", icon: "⚙️" }
  ];

  const isValidTab = tabs.some((tab) => tab.id === selectedTab);

  const platformStats = [
    {
      id: "patients",
      label: "Patients",
      value: "1,248",
      sublabel: "Active in last 90 days",
      icon: "🧑‍⚕️",
      tone: "primary"
    },
    {
      id: "doctors",
      label: "Doctors",
      value: "68",
      sublabel: "Licensed & onboarded",
      icon: "👨‍⚕️",
      tone: "success"
    },
    {
      id: "pharmacists",
      label: "Pharmacies",
      value: "34",
      sublabel: "Integrated partners",
      icon: "💊",
      tone: "neutral"
    },
    {
      id: "pending",
      label: "Pending approvals",
      value: "7",
      sublabel: "Doctors & pharmacies",
      icon: "⏳",
      tone: "warning"
    }
  ];

  const approvalQueue = [
    {
      id: "DR-2201",
      name: "Dr. Anika Rao",
      type: "Doctor",
      speciality: "Endocrinology",
      submitted: "Today, 09:10",
      status: "Pending"
    },
    {
      id: "PH-3320",
      name: "Healthy Life Pharmacy",
      type: "Pharmacy",
      speciality: "Retail",
      submitted: "Yesterday, 18:42",
      status: "Pending"
    }
  ];

  const ordersSummary = [
    {
      id: "ord-1",
      label: "Orders today",
      value: "142",
      meta: "Across all pharmacies"
    },
    {
      id: "payments",
      label: "Payments settled",
      value: "₹2.4L",
      meta: "Last 24 hours"
    },
    {
      id: "refunds",
      label: "Refunds raised",
      value: "6",
      meta: "Pending finance review"
    }
  ];

  const analyticsHighlights = [
    {
      id: "adherence",
      title: "Medication adherence",
      detail: "91% of active patients adhere 80%+ of the time.",
      icon: "📈"
    },
    {
      id: "uptime",
      title: "Platform uptime",
      detail: "99.96% over the last 30 days.",
      icon: "✅"
    },
    {
      id: "orders-growth",
      title: "Order growth",
      detail: "+18% MoM growth across the network.",
      icon: "📦"
    }
  ];

  const handleTabClick = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 ml-0 lg:ml-[240px]">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-6 mt-24 max-h-[calc(100vh-96px)]">
          {!user ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
            </div>
          ) : !isValidTab ? (
            <div className="flex flex-col gap-6 items-center justify-center rounded-3xl border-2 border-dashed border-indigo-200 bg-white p-10 text-center shadow-sm">
              <div>
                <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest">Admin console idle</p>
                <h2 className="mt-3 text-3xl font-bold text-gray-900">Select an admin workspace</h2>
                <p className="mt-2 text-gray-500 max-w-2xl">
                  Use the Admin Console links in the sidebar to open Overview, User Management, Approvals, Orders, or Analytics.
                </p>
              </div>
              <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-left hover:bg-indigo-50"
                    onClick={() => handleTabClick(tab.id)}
                  >
                    <span className="text-2xl" aria-hidden>{tab.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{tab.label}</p>
                      <p className="text-xs text-gray-500">Open {tab.label.toLowerCase()}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {selectedTab === "overview" && (
                <>
                  <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                    {platformStats.map((stat) => (
                      <StatCard key={stat.id} {...stat} />
                    ))}
                  </section>

                  <section className="admin-hero">
                    <div className="admin-hero__glow" aria-hidden />
                    <div className="admin-hero__left">
                      <p className="admin-hero__eyebrow">Platform Control</p>
                      <h1>{title}</h1>
                      <p className="admin-hero__lead">{subtitle}</p>
                      <ul className="admin-hero__meta">
                        <li>🕒 {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</li>
                        <li>🌐 Multi-tenant environment</li>
                        <li>🔐 Role-based access</li>
                      </ul>
                    </div>
                    <div className="admin-hero__right">
                      <article className="admin-hero__card">
                        <p className="admin-hero__card-label">Pending approvals</p>
                        <h3>7</h3>
                        <p>Verify licenses and partner details.</p>
                      </article>
                      <article className="admin-hero__card admin-hero__card--accent">
                        <p className="admin-hero__card-label">Today7s volume</p>
                        <h3>142 orders</h3>
                        <p>Track orders & payment health.</p>
                      </article>
                    </div>
                  </section>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <Card className="admin-section-card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900">User cohorts</h3>
                        <span className="text-xs text-gray-500">Patients · Doctors · Pharmacists</span>
                      </div>
                      <div className="space-y-3 text-sm text-gray-700">
                        <p>Patients: 1,248 active · 182 new this month</p>
                        <p>Doctors: 68 onboarded · 4 pending KYC</p>
                        <p>Pharmacies: 34 live · 3 in sandbox</p>
                      </div>
                    </Card>

                    <Card className="admin-section-card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900">Operational alerts</h3>
                        <span className="text-xs text-gray-500">Realtime risk surface</span>
                      </div>
                      <ul className="space-y-3 text-sm text-gray-700">
                        <li>• 2 pharmacies reporting low stock on chronic meds.</li>
                        <li>• 1 high-value refund awaiting finance review.</li>
                        <li>• 3 doctors yet to complete license re-verification.</li>
                      </ul>
                    </Card>
                  </div>
                </>
              )}

              {selectedTab === "users" && (
                <Card className="admin-section-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
                      <p className="text-sm text-gray-500">View and manage patients, doctors, and pharmacists from one place.</p>
                    </div>
                    <Button size="small" variant="primary" type="button">
                      Add new user
                    </Button>
                  </div>
                  <div className="admin-table" role="table" aria-label="User management table">
                    <div className="admin-table__header" role="row">
                      <span role="columnheader">Name</span>
                      <span role="columnheader">Role</span>
                      <span role="columnheader">Status</span>
                      <span role="columnheader">Last activity</span>
                    </div>
                    <div className="admin-table__row" role="row">
                      <span role="cell">John Doe</span>
                      <span role="cell">Patient</span>
                      <span role="cell">Active</span>
                      <span role="cell">Today, 08:55</span>
                    </div>
                    <div className="admin-table__row" role="row">
                      <span role="cell">Dr. Anika Rao</span>
                      <span role="cell">Doctor</span>
                      <span role="cell">Pending approval</span>
                      <span role="cell">Yesterday, 19:04</span>
                    </div>
                    <div className="admin-table__row" role="row">
                      <span role="cell">Healthy Life Pharmacy</span>
                      <span role="cell">Pharmacy</span>
                      <span role="cell">Active</span>
                      <span role="cell">Today, 07:41</span>
                    </div>
                  </div>
                </Card>
              )}

              {selectedTab === "approvals" && (
                <Card className="admin-section-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Approvals</h2>
                      <p className="text-sm text-gray-500">Review and approve new doctor and pharmacy accounts.</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {approvalQueue.map((request) => (
                      <div
                        key={request.id}
                        className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">
                            {request.name} <span className="text-xs text-gray-500">({request.type})</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            {request.speciality} · Submitted {request.submitted}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="small" variant="success" type="button">
                            Approve
                          </Button>
                          <Button size="small" variant="outline" type="button">
                            Request info
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {selectedTab === "orders" && (
                <Card className="admin-section-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Orders & Payments</h2>
                      <p className="text-sm text-gray-500">Monitor commerce flows across all connected pharmacies.</p>
                    </div>
                    <Button size="small" variant="outline" type="button">
                      Export report
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {ordersSummary.map((card) => (
                      <Card key={card.id} className="p-4 bg-slate-50 border border-slate-100">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">{card.label}</p>
                        <p className="text-2xl font-semibold text-slate-900 mt-1">{card.value}</p>
                        <p className="text-xs text-slate-500 mt-1">{card.meta}</p>
                      </Card>
                    ))}
                  </div>
                  <div className="admin-table" role="table" aria-label="Recent orders table">
                    <div className="admin-table__header" role="row">
                      <span role="columnheader">Order ID</span>
                      <span role="columnheader">Pharmacy</span>
                      <span role="columnheader">Amount</span>
                      <span role="columnheader">Status</span>
                    </div>
                    <div className="admin-table__row" role="row">
                      <span role="cell">ORD-982417</span>
                      <span role="cell">Healthy Life Pharmacy</span>
                      <span role="cell">₹2,100</span>
                      <span role="cell">Settled</span>
                    </div>
                    <div className="admin-table__row" role="row">
                      <span role="cell">ORD-982418</span>
                      <span role="cell">City Care Pharmacy</span>
                      <span role="cell">₹780</span>
                      <span role="cell">On hold</span>
                    </div>
                  </div>
                </Card>
              )}

              {selectedTab === "analytics" && (
                <Card className="admin-section-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Analytics & Reports</h2>
                      <p className="text-sm text-gray-500">High-level view of how MediCose is performing.</p>
                    </div>
                    <Button size="small" variant="primary" type="button">
                      Schedule weekly email
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {analyticsHighlights.map((item) => (
                      <Card key={item.id} className="p-4 bg-white border border-slate-100">
                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <span aria-hidden>{item.icon}</span>
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">{item.detail}</p>
                      </Card>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    This is a demo analytics surface. In a production deployment, this section would be wired to your data
                    warehouse or analytics layer (for example, BigQuery, Snowflake, or ClickHouse).
                  </p>
                </Card>
              )}

              {selectedTab === "settings" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="admin-section-card p-6">
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">Platform Settings</h2>
                      <p className="text-sm text-gray-500">
                        Configure global toggles such as verification rules, notification defaults, and maintenance banners.
                      </p>
                    </div>
                    <div className="space-y-4 text-sm text-gray-700">
                      <div className="flex items-start gap-3">
                        <input id="setting-strict-kyc" type="checkbox" defaultChecked className="mt-1" />
                        <label htmlFor="setting-strict-kyc">
                          <span className="font-semibold">Strict KYC for doctors and pharmacies</span>
                          <br />
                          Require license verification and manual approval before first access.
                        </label>
                      </div>
                      <div className="flex items-start gap-3">
                        <input id="setting-payment-holds" type="checkbox" defaultChecked className="mt-1" />
                        <label htmlFor="setting-payment-holds">
                          <span className="font-semibold">Hold payouts on suspicious activity</span>
                          <br />
                          Automatically flag and hold high-risk orders for finance review.
                        </label>
                      </div>
                      <div className="flex items-start gap-3">
                        <input id="setting-maintenance" type="checkbox" className="mt-1" />
                        <label htmlFor="setting-maintenance">
                          <span className="font-semibold">Show maintenance banner</span>
                          <br />
                          Display a network-wide message during planned updates.
                        </label>
                      </div>
                    </div>
                  </Card>

                  <Card className="admin-section-card p-0 overflow-hidden">
                    <Settings />
                  </Card>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
