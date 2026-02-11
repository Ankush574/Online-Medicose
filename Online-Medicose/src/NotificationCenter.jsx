import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./NotificationCenter.css";

export const notificationSeed = [
  {
    id: 1,
    type: "appointment",
    title: "Appointment reminder",
    message: "Your consultation with Dr. Sarah Johnson begins in 2 hours.",
    channel: "Push • Calendar",
    time: "Today, 2:00 PM",
    icon: "📅",
    read: false
  },
  {
    id: 2,
    type: "medication",
    title: "Medication follow-up",
    message: "Metformin refill synced. Approve the smart refill to stay on track.",
    channel: "Email",
    time: "20 mins ago",
    icon: "💊",
    read: false
  },
  {
    id: 3,
    type: "health",
    title: "Vitals trending high",
    message: "Blood pressure logged at 138/92. Share the series with your clinician?",
    channel: "Push • HealthKit",
    time: "1 hour ago",
    icon: "📈",
    read: false
  },
  {
    id: 4,
    type: "medication",
    title: "Evening dose missed",
    message: "We did not detect your 7:30 PM asthma inhaler dose. Snooze or log now.",
    channel: "SMS failsafe",
    time: "Last night",
    icon: "⚠️",
    read: true
  },
  {
    id: 5,
    type: "appointment",
    title: "Labs ready",
    message: "Endocrinology labs were uploaded. Review before tomorrow's round.",
    channel: "Portal",
    time: "Yesterday",
    icon: "🧪",
    read: true
  }
];

const defaultChannels = [
  { id: "email", label: "Email digest", detail: "7:00 AM summary", enabled: true },
  { id: "push", label: "Push alerts", detail: "Instant high-priority", enabled: true },
  { id: "sms", label: "SMS failsafe", detail: "Only when offline", enabled: false }
];

const timelineReminders = [
  { id: 1, label: "08:30 AM • Medication", detail: "Aspirin 500mg morning dose" },
  { id: 2, label: "01:00 PM • Appointment", detail: "Video consult with Dr. Chen" },
  { id: 3, label: "07:30 PM • Medication", detail: "Metformin evening reminder" }
];

const filterOptions = [
  { value: "all", label: "All" },
  { value: "appointment", label: "Appointments" },
  { value: "medication", label: "Medications" },
  { value: "health", label: "Health" }
];

const NotificationCenter = ({
  embedded = false,
  notifications: controlledNotifications,
  onNotificationsChange,
  onClose,
  onUnreadChange
}) => {
  const [filter, setFilter] = useState("all");
  const [internalNotifications, setInternalNotifications] = useState(notificationSeed);
  const [channelPreferences, setChannelPreferences] = useState(defaultChannels);

  const notifications = controlledNotifications ?? internalNotifications;
  const setNotifications = onNotificationsChange ?? setInternalNotifications;

  const unreadCount = useMemo(
    () => notifications.filter(notification => !notification.read).length,
    [notifications]
  );

  const medicationAlerts = useMemo(
    () => notifications.filter(notification => notification.type === "medication").length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (filter === "all") {
      return notifications;
    }
    return notifications.filter(notification => notification.type === filter);
  }, [filter, notifications]);

  const notificationMetrics = useMemo(
    () => [
      { id: "total", label: "Total alerts", value: notifications.length, meta: "live feed" },
      { id: "unread", label: "Needs focus", value: unreadCount, meta: "unread" },
      { id: "meds", label: "Medication nudges", value: medicationAlerts, meta: "habit focus" },
      { id: "success", label: "Actioned", value: "86%", meta: "last 7 days" }
    ],
    [notifications.length, unreadCount, medicationAlerts]
  );

  useEffect(() => {
    if (onUnreadChange) {
      onUnreadChange(unreadCount);
    }
  }, [onUnreadChange, unreadCount]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  const markNotificationRead = id => {
    setNotifications(prev =>
      prev.map(notification => (
        notification.id === id ? { ...notification, read: true } : notification
      ))
    );
  };

  const dismissNotification = id => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const toggleChannel = id => {
    setChannelPreferences(prev =>
      prev.map(channel =>
        channel.id === id ? { ...channel, enabled: !channel.enabled } : channel
      )
    );
  };

  const renderNotificationItems = () => {
    if (filteredNotifications.length === 0) {
      return <p className="empty-state">Everything is calm. Try another filter.</p>;
    }

    return filteredNotifications.map(notification => (
      <article
        key={notification.id}
        className={`notification-item ${notification.read ? "read" : "unread"}`}
      >
        <div className="notification-icon" aria-hidden>
          {notification.icon}
        </div>
        <div className="notification-content">
          <h3>{notification.title}</h3>
          <p>{notification.message}</p>
          <small>
            {notification.channel} • {notification.time}
          </small>
          {!notification.read && (
            <button
              className="mark-all-btn"
              onClick={() => markNotificationRead(notification.id)}
            >
              Mark read
            </button>
          )}
        </div>
        <button className="delete-btn" onClick={() => dismissNotification(notification.id)}>
          ✕
        </button>
      </article>
    ));
  };

  if (embedded) {
    return (
      <div className="notification-panel">
        <div className="notification-header">
          <h2>Notifications</h2>
          <div className="notification-controls">
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={markAllAsRead}>
                Clear {unreadCount}
              </button>
            )}
            {onClose && (
              <button className="close-btn" onClick={onClose} aria-label="Close notifications">
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="notification-filters">
          {filterOptions.map(option => (
            <button
              key={option.value}
              className={`filter-btn ${filter === option.value ? "active" : ""}`}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="notification-list">{renderNotificationItems()}</div>
      </div>
    );
  }

  return (
    <section className="notification-main">
      <header className="notification-hero">
        <div>
          <p className="eyebrow">Signal center</p>
          <h1>Notification Center</h1>
          <p className="subcopy">Review alerts, mute noise, and keep your care team in sync.</p>
        </div>
        <div className="hero-actions">
          <button className="ghost-btn" onClick={markAllAsRead} disabled={unreadCount === 0}>
            {unreadCount === 0 ? "All caught up" : "Mark all read"}
          </button>
          <Link to="/dashboard" className="link-pill">
            Back to dashboard
          </Link>
        </div>
      </header>

      <section className="notification-metrics">
        {notificationMetrics.map(metric => (
          <article key={metric.id} className="notification-metric-card">
            <p className="metric-label">{metric.label}</p>
            <p className="metric-value">{metric.value}</p>
            <p className="metric-meta">{metric.meta}</p>
          </article>
        ))}
      </section>

      <section className="notification-control-bar">
        <div>
          <p className="section-label">Smart filters</p>
          <div className="notification-filters">
            {filterOptions.map(option => (
              <button
                key={option.value}
                className={`filter-btn ${filter === option.value ? "active" : ""}`}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="preference-switches">
          {channelPreferences.map(channel => (
            <label
              key={channel.id}
              className={`channel-toggle ${channel.enabled ? "enabled" : ""}`}
              onClick={() => toggleChannel(channel.id)}
            >
              <span>
                <strong>{channel.label}</strong>
                <small>{channel.detail}</small>
              </span>
              <input type="checkbox" checked={channel.enabled} readOnly />
              <span className="toggle-pill" aria-hidden />
            </label>
          ))}
        </div>
      </section>

      <div className="notification-layout">
        <section className="notification-feed">
          <div className="notification-feed-header">
            <div>
              <h2>Activity feed</h2>
              <p>{filteredNotifications.length} updates</p>
            </div>
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={markAllAsRead}>
                Mark unread ({unreadCount}) as read
              </button>
            )}
          </div>
          <div className="notification-list">{renderNotificationItems()}</div>
        </section>

        <aside className="notification-side-panel">
          <div className="panel-card">
            <h3>Channel preferences</h3>
            <ul>
              {channelPreferences.map(channel => (
                <li key={channel.id}>
                  <span>{channel.label}</span>
                  <span className={channel.enabled ? "status-enabled" : "status-muted"}>
                    {channel.enabled ? "On" : "Muted"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="panel-card">
            <h3>Upcoming reminders</h3>
            <ul className="timeline">
              {timelineReminders.map(reminder => (
                <li key={reminder.id}>
                  <p>{reminder.label}</p>
                  <small>{reminder.detail}</small>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default NotificationCenter;
