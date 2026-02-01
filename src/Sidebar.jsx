import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { useSidebar } from "./SidebarContext";
import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const { user } = React.useContext(AuthContext);
  const { isOpen, closeSidebar } = useSidebar();
  const isDoctor = user?.role === "Doctor";
  const isPharmacist = user?.role === "Pharmacist";
    const isAdmin = user?.role === "Admin";
  const searchParams = React.useMemo(() => new URLSearchParams(location.search), [location.search]);
  const doctorSidebarTab = isDoctor && location.pathname === "/doctor-dashboard" ? searchParams.get('tab') : null;
  const pharmacistSidebarTab = isPharmacist && location.pathname === "/pharmacist-dashboard" ? searchParams.get('tab') : null;
    const adminSidebarTab = isAdmin && location.pathname === "/admin-dashboard" ? searchParams.get('tab') : null;

  const doctorNavItems = [
    { tab: 'overview', label: 'Overview', icon: '📊' },
    { tab: 'patients', label: 'Patients', icon: '👥' },
    { tab: 'appointments', label: 'Appointments', icon: '📅' },
    { tab: 'prescriptions', label: 'Prescriptions', icon: '💊' },
    { tab: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const pharmacistNavItems = [
    { tab: 'overview', label: 'Overview', icon: '📊' },
    { tab: 'prescriptions', label: 'Prescriptions', icon: '💊' },
    { tab: 'inventory', label: 'Inventory', icon: '📦' },
    { tab: 'refills', label: 'Refill Requests', icon: '🔄' },
    { tab: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const adminNavItems = [
    { tab: 'overview', label: 'Overview', icon: '📊' },
    { tab: 'users', label: 'User Management', icon: '👥' },
    { tab: 'approvals', label: 'Approvals', icon: '✅' },
    { tab: 'orders', label: 'Orders & Payments', icon: '💳' },
    { tab: 'analytics', label: 'Analytics & Reports', icon: '📈' },
    { tab: 'settings', label: 'Platform Settings', icon: '⚙️' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">💊</span>
          <div>
            <h2>MediCose</h2>
            <p className="sidebar-tagline">Care orchestration</p>
          </div>
        </div>
      </div>
      <div className="sidebar-accent" aria-hidden="true" />

      <nav className="sidebar-nav">
        {!isDoctor && !isPharmacist && !isAdmin && (
          <>
            <Link
              to="/dashboard"
              className={`nav-item ${isActive("/dashboard") || location.pathname.startsWith("/dashboard/") ? "active" : ""}`}
              onClick={closeSidebar}
            >
              <span className="nav-icon">🏠</span>
              <span className="nav-label">Dashboard</span>
            </Link>

            {/* Health Management */}
            <div className="nav-section">
              <div className="nav-section-title">Health</div>
              <Link
                to="/dashboard/medications"
                className={`nav-item ${location.pathname === "/dashboard/medications" ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">💊</span>
                <span className="nav-label">Medications</span>
              </Link>

              <Link
                to="/dashboard/appointments"
                className={`nav-item ${location.pathname === "/dashboard/appointments" ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">📅</span>
                <span className="nav-label">Appointments</span>
              </Link>

              <Link
                to="/dashboard/prescriptions"
                className={`nav-item ${location.pathname === "/dashboard/prescriptions" ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">📋</span>
                <span className="nav-label">Prescriptions</span>
              </Link>

              <Link
                to="/dashboard/refills"
                className={`nav-item ${location.pathname === "/dashboard/refills" ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">🔄</span>
                <span className="nav-label">Refills</span>
              </Link>

              <Link
                to="/dashboard/analytics"
                className={`nav-item ${location.pathname === "/dashboard/analytics" ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">📊</span>
                <span className="nav-label">Analytics</span>
              </Link>
            </div>

            {/* E-commerce */}
            <div className="nav-section">
              <div className="nav-section-title">Shop</div>
              <Link
                to="/shop"
                className={`nav-item ${isActive("/shop") ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">🛒</span>
                <span className="nav-label">Shop Medicines</span>
              </Link>

              <Link
                to="/cart"
                className={`nav-item ${isActive("/cart") ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">🛍️</span>
                <span className="nav-label">Cart</span>
              </Link>

              <Link
                to="/dashboard/orders"
                className={`nav-item ${location.pathname === "/dashboard/orders" ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">📦</span>
                <span className="nav-label">Order History</span>
              </Link>
            </div>

            {/* Services */}
            <div className="nav-section">
              <div className="nav-section-title">Services</div>
              <Link
                to="/dashboard/consultation"
                className={`nav-item ${location.pathname === "/dashboard/consultation" ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">📹</span>
                <span className="nav-label">Video Consultation</span>
              </Link>

              <Link
                to="/dashboard/hospitals"
                className={`nav-item ${location.pathname === "/dashboard/hospitals" ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">🏥</span>
                <span className="nav-label">Hospital Management</span>
              </Link>
            </div>

            {/* Account */}
            <div className="nav-section">
              <div className="nav-section-title">Account</div>
              <Link
                to="/dashboard/profile"
                className={`nav-item ${location.pathname === "/dashboard/profile" ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">👤</span>
                <span className="nav-label">Profile</span>
              </Link>

              <Link
                to="/dashboard/notifications"
                className={`nav-item ${location.pathname === "/dashboard/notifications" ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">🔔</span>
                <span className="nav-label">Notifications</span>
              </Link>

              <Link
                to="/dashboard/settings"
                className={`nav-item ${location.pathname === "/dashboard/settings" ? "active" : ""}`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">⚙️</span>
                <span className="nav-label">Settings</span>
              </Link>
            </div>
          </>
        )}

        {user?.role === "Doctor" && (
          <div className="nav-section">
            <div className="nav-section-title">Doctor Workspace</div>
            {doctorNavItems.map((item) => (
              <Link
                key={item.tab}
                to={`/doctor-dashboard?tab=${item.tab}`}
                className={`nav-item ${
                  location.pathname === "/doctor-dashboard" && doctorSidebarTab === item.tab
                    ? "active"
                    : ""
                }`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </div>
        )}

        {user?.role === "Pharmacist" && (
          <div className="nav-section">
            <div className="nav-section-title">Pharmacist Console</div>
            {pharmacistNavItems.map((item) => (
              <Link
                key={item.tab}
                to={`/pharmacist-dashboard?tab=${item.tab}`}
                className={`nav-item ${
                  location.pathname === "/pharmacist-dashboard" && pharmacistSidebarTab === item.tab
                    ? "active"
                    : ""
                }`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </div>
        )}

        {user?.role === "Admin" && (
          <div className="nav-section">
            <div className="nav-section-title">Admin Console</div>
            {adminNavItems.map((item) => (
              <Link
                key={item.tab}
                to={`/admin-dashboard?tab=${item.tab}`}
                className={`nav-item ${
                  location.pathname === "/admin-dashboard" && adminSidebarTab === item.tab
                    ? "active"
                    : ""
                }`}
                onClick={closeSidebar}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </div>
        )}

        <div className="nav-section nav-section--utility">
          <div className="nav-section-title">Utility</div>
          <Link to="/login" className="nav-item logout-link" onClick={closeSidebar}>
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </Link>
        </div>
      </nav>
    </aside>
    <button
      type="button"
      className={`sidebar-backdrop ${isOpen ? "visible" : ""}`}
      aria-label="Close navigation"
      aria-hidden={!isOpen}
      tabIndex={isOpen ? 0 : -1}
      onClick={closeSidebar}
    />
    </>
  );
};

export default Sidebar;
