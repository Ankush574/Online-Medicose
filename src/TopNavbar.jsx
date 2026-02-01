import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { useSidebar } from "./SidebarContext";
import NotificationCenter, { notificationSeed } from "./NotificationCenter";
import "./TopNavbar.css";

const TopNavbar = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { isOpen: isSidebarOpen, toggleSidebar } = useSidebar();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState(notificationSeed);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const handleOpenSettings = () => {
    if (user?.role === "Doctor") {
      navigate("/doctor-dashboard?tab=settings");
    } else if (user?.role === "Pharmacist") {
      navigate("/pharmacist-dashboard?tab=settings");
    } else {
      navigate("/dashboard/settings");
    }
    setShowUserMenu(false);
  };

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button
          className="navbar-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={isSidebarOpen}
          onClick={toggleSidebar}
        >
          ☰
        </button>
        <p className="app-name">MediCose</p>
      </div>

      <div className="navbar-right">
        {/* Notification Bell */}
        <div className="notification-container">
          <button
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Toggle notifications"
          >
            🔔
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <NotificationCenter
              embedded
              notifications={notifications}
              onNotificationsChange={setNotifications}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </div>

        {/* User Avatar */}
        <div className="user-container">
          <button
            className="user-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <span className="user-avatar">👤</span>
            <span className="user-name">{user?.name || "User"}</span>
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-info">
                <p className="user-email">{user?.email || "user@example.com"}</p>
                <p className="user-role">Role: {user?.role || "User"}</p>
              </div>
              <div className="user-menu-divider"></div>
              <button
                className="user-menu-item"
                onClick={handleOpenSettings}
              >
                ⚙️ Settings
              </button>
              {/* Theme toggle removed; app uses a single light theme now. */}
              <div className="user-menu-divider"></div>
              <button
                className="user-menu-item logout-btn"
                onClick={() => {
                  navigate("/login");
                  setShowUserMenu(false);
                }}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
