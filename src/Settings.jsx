import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import Card from "./components/Card";
import Button from "./components/Button";

const defaultSettings = {
  notifications: {
    email: true,
    sms: false,
    inApp: true
  },
  preferences: {
    userDashboardDefault: "home",
    doctorDashboardDefaultTab: "overview",
    pharmacistDashboardDefaultTab: "overview"
  }
};

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [settings, setSettings] = useState(defaultSettings);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!user || !user.id) return;
    try {
      const raw = localStorage.getItem(`settings_${user.id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings((prev) => ({
          notifications: {
            ...prev.notifications,
            ...(parsed.notifications || {})
          },
          preferences: {
            ...prev.preferences,
            ...(parsed.preferences || {})
          }
        }));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setHasLoaded(true);
    }
  }, [user]);

  const handleSave = () => {
    if (!user || !user.id) return;
    try {
      localStorage.setItem(`settings_${user.id}`, JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const updateNotification = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const updatePreference = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500">
        Loading settings...
      </div>
    );
  }

  const role = user.role || "User";
  const isDoctor = role === "Doctor";
  const isPharmacist = role === "Pharmacist";

  const userDashboardOptions = [
    { value: "home", label: "Home overview" },
    { value: "medications", label: "Medications" },
    { value: "appointments", label: "Appointments" },
    { value: "prescriptions", label: "Prescriptions" },
    { value: "analytics", label: "Health analytics" },
    { value: "refills", label: "Medication refills" },
    { value: "orders", label: "Order history" },
    { value: "consultation", label: "Video consultation" },
    { value: "hospitals", label: "Hospitals directory" },
    { value: "profile", label: "Profile" }
  ];

  const doctorTabOptions = [
    { value: "overview", label: "Overview" },
    { value: "patients", label: "Patients" },
    { value: "appointments", label: "Appointments" },
    { value: "prescriptions", label: "Prescriptions" }
  ];

  const pharmacistTabOptions = [
    { value: "overview", label: "Overview" },
    { value: "prescriptions", label: "Prescriptions" },
    { value: "inventory", label: "Inventory" },
    { value: "refills", label: "Refill requests" }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="space-y-1">
        <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">Settings</p>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard preferences</h1>
        <p className="text-sm text-gray-500">
          Adjust how MediCose looks and behaves for your {role.toLowerCase()} workspace.
        </p>
      </header>

      {!hasLoaded && (
        <div className="animate-pulse rounded-xl bg-gray-100 h-24" aria-hidden></div>
      )}

      {/* Theme appearance controls removed; app uses a single light theme. */}

      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-500">Choose how you want to be notified.</p>
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="rounded"
              checked={settings.notifications.email}
              onChange={(e) => updateNotification("email", e.target.checked)}
            />
            <span>Email updates</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="rounded"
              checked={settings.notifications.sms}
              onChange={(e) => updateNotification("sms", e.target.checked)}
            />
            <span>SMS alerts</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="rounded"
              checked={settings.notifications.inApp}
              onChange={(e) => updateNotification("inApp", e.target.checked)}
            />
            <span>In-app notifications</span>
          </label>
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Dashboard defaults</h2>
          <p className="text-sm text-gray-500">Control where you land first when opening each dashboard.</p>
        </div>

        {!isDoctor && !isPharmacist && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-800">Patient dashboard</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {userDashboardOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer ${
                    settings.preferences.userDashboardDefault === option.value
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="userDashboardDefault"
                    className="text-indigo-600"
                    checked={settings.preferences.userDashboardDefault === option.value}
                    onChange={() => updatePreference("userDashboardDefault", option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {isDoctor && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-800">Doctor workspace</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {doctorTabOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer ${
                    settings.preferences.doctorDashboardDefaultTab === option.value
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="doctorDashboardDefaultTab"
                    className="text-indigo-600"
                    checked={settings.preferences.doctorDashboardDefaultTab === option.value}
                    onChange={() => updatePreference("doctorDashboardDefaultTab", option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {isPharmacist && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-800">Pharmacist console</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {pharmacistTabOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer ${
                    settings.preferences.pharmacistDashboardDefaultTab === option.value
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="pharmacistDashboardDefaultTab"
                    className="text-indigo-600"
                    checked={settings.preferences.pharmacistDashboardDefaultTab === option.value}
                    onChange={() => updatePreference("pharmacistDashboardDefaultTab", option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <Button onClick={handleSave} size="small">
            Save preferences
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
