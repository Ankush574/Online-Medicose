import React, { useMemo, useState } from "react";
import "./MedicationRefill.css";

const requestSeed = [
  {
    id: "REQ-2315",
    medication: "Metformin 500mg",
    quantity: 60,
    pharmacy: "HealthCare Plus Pharmacy",
    status: "processing",
    requestedOn: "Jan 10, 2026",
    requestedAt: Date.parse("2026-01-10T09:15:00"),
    eta: "Jan 12, 2026",
    etaWindow: "09:00 - 11:00 AM",
    channel: "Home delivery",
    cost: "₹820",
    trackingId: "RX-2315",
    etaDays: 2,
    nextStep: "Courier pickup confirmed",
  },
  {
    id: "REQ-2302",
    medication: "Lisinopril 10mg",
    quantity: 30,
    pharmacy: "City Medical Store",
    status: "pending",
    requestedOn: "Jan 09, 2026",
    requestedAt: Date.parse("2026-01-09T13:45:00"),
    eta: "Jan 11, 2026",
    etaWindow: "01:00 - 03:00 PM",
    channel: "Counter pickup",
    cost: "₹360",
    trackingId: "RX-2302",
    etaDays: 3,
    nextStep: "Awaiting prescriber approval",
  },
  {
    id: "REQ-2288",
    medication: "Amlodipine 5mg",
    quantity: 90,
    pharmacy: "Express Pharmacy",
    status: "outForDelivery",
    requestedOn: "Jan 08, 2026",
    requestedAt: Date.parse("2026-01-08T08:20:00"),
    eta: "Arriving today",
    etaWindow: "04:00 - 06:00 PM",
    channel: "Home delivery",
    cost: "₹910",
    trackingId: "RX-2288",
    etaDays: 1,
    nextStep: "Courier en route",
  },
  {
    id: "REQ-2271",
    medication: "Budesonide Inhaler",
    quantity: 1,
    pharmacy: "Metro Health Mart",
    status: "delivered",
    requestedOn: "Jan 03, 2026",
    requestedAt: Date.parse("2026-01-03T11:05:00"),
    eta: "Delivered Jan 05",
    etaWindow: "Signed 02:14 PM",
    channel: "Home delivery",
    cost: "₹1,250",
    trackingId: "RX-2271",
    etaDays: 2,
    nextStep: "Completion logged",
  },
];

const inventorySeed = [
  {
    id: "metformin",
    name: "Metformin",
    dosage: "500mg",
    schedule: "2x daily",
    daysLeft: 8,
    coverageDays: 30,
    nextRefill: "Jan 16",
    channel: "Auto-refill",
    autoRefill: true,
    threshold: 10,
  },
  {
    id: "lisinopril",
    name: "Lisinopril",
    dosage: "10mg",
    schedule: "Morning",
    daysLeft: 5,
    coverageDays: 30,
    nextRefill: "Jan 13",
    channel: "Manual",
    autoRefill: false,
    threshold: 7,
  },
  {
    id: "amlodipine",
    name: "Amlodipine",
    dosage: "5mg",
    schedule: "Night",
    daysLeft: 18,
    coverageDays: 45,
    nextRefill: "Jan 28",
    channel: "Auto-refill",
    autoRefill: true,
    threshold: 8,
  },
  {
    id: "budesonide",
    name: "Budesonide",
    dosage: "200mcg",
    schedule: "As needed",
    daysLeft: 11,
    coverageDays: 25,
    nextRefill: "Jan 20",
    channel: "Manual",
    autoRefill: false,
    threshold: 10,
  },
];

const pharmacySeed = [
  {
    id: "ph-1",
    name: "HealthCare Plus Pharmacy",
    rating: 4.8,
    deliveryTime: "Same-day courier",
    savings: "Avg ₹180 savings",
    distance: "2.4 km",
  },
  {
    id: "ph-2",
    name: "City Medical Store",
    rating: 4.6,
    deliveryTime: "Next-day pickup",
    savings: "Bulk refill pricing",
    distance: "5.1 km",
  },
  {
    id: "ph-3",
    name: "Express Pharmacy",
    rating: 4.9,
    deliveryTime: "4 hr urban delivery",
    savings: "₹99 courier credit",
    distance: "3.2 km",
  },
];

const automationPrograms = [
  {
    id: "alerts",
    title: "Low-stock alerts",
    detail: "Ping caregiver when supply < 5 days",
    status: "active",
  },
  {
    id: "sync",
    title: "Prescription sync",
    detail: "Pull new e-prescriptions nightly",
    status: "active",
  },
  {
    id: "bundles",
    title: "Bundle shipping",
    detail: "Combine refills to reduce fees",
    status: "paused",
  },
];

const statusTokens = {
  pending: { label: "Pending verification", tone: "warning" },
  processing: { label: "Fulfillment in progress", tone: "info" },
  approved: { label: "Approved", tone: "info" },
  outForDelivery: { label: "Out for delivery", tone: "success" },
  delivered: { label: "Delivered", tone: "muted" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

const MedicationRefill = ({ embedded = false }) => {
  const [requests, setRequests] = useState(requestSeed);
  const [inventory, setInventory] = useState(inventorySeed);
  const [composerOpen, setComposerOpen] = useState(false);
  const [success, setSuccess] = useState("");
  const [composer, setComposer] = useState({
    medicationId: inventorySeed[0]?.id ?? "",
    quantity: "30",
    pharmacyId: pharmacySeed[0]?.id ?? "",
    delivery: "home",
    notes: "",
  });

  const metrics = useMemo(() => {
    const activePipeline = requests.filter((request) =>
      ["pending", "processing", "approved", "outForDelivery"].includes(
        request.status,
      ),
    ).length;
    const autoEnabled = inventory.filter((item) => item.autoRefill).length;
    const avgCoverage = inventory.length
      ? Math.round(
          inventory.reduce((sum, item) => sum + item.daysLeft, 0) /
            inventory.length,
        )
      : 0;
    const lowStock = inventory.filter(
      (item) => item.daysLeft <= item.threshold,
    ).length;
    return [
      {
        id: "pipeline",
        label: "Active requests",
        value: activePipeline,
        meta: "in motion",
      },
      {
        id: "auto",
        label: "Auto-refill meds",
        value: autoEnabled,
        meta: "hands-free",
      },
      {
        id: "coverage",
        label: "Avg days covered",
        value: avgCoverage,
        meta: "across meds",
      },
      {
        id: "alerts",
        label: "Risk alerts",
        value: lowStock,
        meta: "need action",
      },
    ];
  }, [inventory, requests]);

  const criticalInventory = useMemo(
    () => inventory.filter((item) => item.daysLeft <= item.threshold),
    [inventory],
  );

  const sortedRequests = useMemo(
    () => [...requests].sort((a, b) => b.requestedAt - a.requestedAt),
    [requests],
  );

  const handleComposerChange = (event) => {
    const { name, value } = event.target;
    setComposer((prev) => ({ ...prev, [name]: value }));
    setSuccess("");
  };

  const handleSubmitRequest = (event) => {
    event.preventDefault();
    const medication = inventory.find(
      (item) => item.id === composer.medicationId,
    );
    const pharmacy = pharmacySeed.find(
      (item) => item.id === composer.pharmacyId,
    );
    if (!medication || !pharmacy) return;

    const quantity = Number(composer.quantity) || 30;
    const requestedAt = Date.now();
    const requestedOn = new Date(requestedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const newRequest = {
      id: `REQ-${requestedAt.toString().slice(-4)}`,
      medication: `${medication.name} ${medication.dosage}`,
      quantity,
      pharmacy: pharmacy.name,
      status: "pending",
      requestedOn,
      requestedAt,
      eta: "Awaiting ETA",
      etaWindow:
        composer.delivery === "pickup" ? "Pickup in 24h" : "ETA shared soon",
      channel:
        composer.delivery === "pickup" ? "Store pickup" : "Home delivery",
      cost: "—",
      trackingId: `RX-${requestedAt.toString().slice(-4)}`,
      etaDays: 2,
      nextStep: "Pharmacy reviewing",
    };

    setRequests((prev) => [newRequest, ...prev]);
    setComposer((prev) => ({ ...prev, quantity: "30", notes: "" }));
    setComposerOpen(false);
    setSuccess("Refill request submitted.");
  };

  const handleCancelRequest = (requestId) => {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === requestId &&
        ["pending", "processing"].includes(request.status)
          ? {
              ...request,
              status: "cancelled",
              nextStep: "Marked for cancellation",
            }
          : request,
      ),
    );
    setSuccess("Request cancelled.");
  };

  const handleToggleAutoRefill = (medicationId) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === medicationId
          ? { ...item, autoRefill: !item.autoRefill }
          : item,
      ),
    );
    setSuccess("Auto-refill preferences updated.");
  };

  const nudgePharmacy = () => {
    setSuccess("Pharmacy notified about priority handling.");
  };

  const workspace = (
    <section className="refill-shell">
      <header className="refill-hero">
        <div>
          <p className="eyebrow">Continuity of care</p>
          <h1>Medication Refill Orchestrator</h1>
          <p>
            Automate stock checks, track pharmacy pipelines, and remove refill
            anxiety.
          </p>
        </div>
        <div className="hero-actions">
          <button className="primary-btn" onClick={() => setComposerOpen(true)}>
            New refill request
          </button>
          <button className="ghost-btn" onClick={nudgePharmacy}>
            Nudge pharmacy
          </button>
        </div>
      </header>

      <section className="refill-metrics">
        {metrics.map((metric) => (
          <article key={metric.id} className="refill-metric-card">
            <p className="metric-label">{metric.label}</p>
            <p className="metric-value">{metric.value}</p>
            <p className="metric-meta">{metric.meta}</p>
          </article>
        ))}
      </section>

      <div className="refill-layout">
        <div className="refill-primary">
          {success && <div className="toast success">{success}</div>}

          <section className="requests-board">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Fulfillment</p>
                <h2>Refill pipeline</h2>
              </div>
              <button
                className="ghost-btn"
                onClick={() => alert("Exporting timeline…")}
              >
                Export log
              </button>
            </div>
            <ul className="request-list">
              {sortedRequests.map((request) => {
                const token =
                  statusTokens[request.status] || statusTokens.pending;
                return (
                  <li key={request.id} className="request-card">
                    <div className="request-card__header">
                      <div>
                        <p className="eyebrow">{request.id}</p>
                        <h3>{request.medication}</h3>
                        <p>
                          {request.quantity} doses · {request.pharmacy}
                        </p>
                      </div>
                      <span
                        className={`status-pill status-pill--${token.tone}`}
                      >
                        {token.label}
                      </span>
                    </div>
                    <div className="request-meta">
                      <div>
                        <p className="muted">Requested</p>
                        <p>{request.requestedOn}</p>
                      </div>
                      <div>
                        <p className="muted">ETA</p>
                        <p>{request.eta}</p>
                        <span>{request.etaWindow}</span>
                      </div>
                      <div>
                        <p className="muted">Channel</p>
                        <p>{request.channel}</p>
                        <span>{request.cost}</span>
                      </div>
                      <div>
                        <p className="muted">Next</p>
                        <p>{request.nextStep}</p>
                        <span>{request.trackingId}</span>
                      </div>
                    </div>
                    <div className="request-actions">
                      {request.status === "pending" && (
                        <button className="ghost-btn" onClick={nudgePharmacy}>
                          Escalate
                        </button>
                      )}
                      {["pending", "processing"].includes(request.status) && (
                        <button
                          className="danger-btn"
                          onClick={() => handleCancelRequest(request.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="inventory-board">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Supply health</p>
                <h2>Inventory tracker</h2>
              </div>
              <button
                className="ghost-btn"
                onClick={() => setComposerOpen(true)}
              >
                Queue refill
              </button>
            </div>
            <div className="inventory-grid">
              {inventory.map((item) => {
                const coveragePercent = Math.min(
                  Math.round((item.daysLeft / item.coverageDays) * 100),
                  100,
                );
                const critical = item.daysLeft <= item.threshold;
                return (
                  <article
                    key={item.id}
                    className={`inventory-card ${critical ? "inventory-card--critical" : ""}`}
                  >
                    <header>
                      <div>
                        <h3>{item.name}</h3>
                        <p>
                          {item.dosage} · {item.schedule}
                        </p>
                      </div>
                      <span
                        className={`badge ${critical ? "badge-danger" : "badge-soft"}`}
                      >
                        {critical ? "Refill soon" : "Healthy"}
                      </span>
                    </header>
                    <div className="inventory-progress">
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${coveragePercent}%` }}
                        />
                      </div>
                      <div className="inventory-meta">
                        <span>{item.daysLeft} days left</span>
                        <span>Refill on {item.nextRefill}</span>
                      </div>
                    </div>
                    <footer>
                      <span>{item.channel}</span>
                      <div className="inventory-actions">
                        <button
                          className="ghost-btn"
                          onClick={() => handleToggleAutoRefill(item.id)}
                        >
                          {item.autoRefill ? "Disable auto" : "Enable auto"}
                        </button>
                        <button
                          className="primary-btn"
                          onClick={() => {
                            setComposer((prev) => ({
                              ...prev,
                              medicationId: item.id,
                            }));
                            setComposerOpen(true);
                          }}
                        >
                          Reorder
                        </button>
                      </div>
                    </footer>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="refill-secondary">
          <section className="composer-panel">
            <header className="section-heading">
              <div>
                <p className="eyebrow">Smart composer</p>
                <h3>{composerOpen ? "Submit refill" : "Build a refill"}</h3>
              </div>
              <button
                className="ghost-btn"
                onClick={() => setComposerOpen((prev) => !prev)}
              >
                {composerOpen ? "Close" : "Open"}
              </button>
            </header>
            {composerOpen ? (
              <form className="composer-form" onSubmit={handleSubmitRequest}>
                <label>
                  Medication
                  <select
                    name="medicationId"
                    value={composer.medicationId}
                    onChange={handleComposerChange}
                  >
                    {inventory.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} · {item.dosage}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="form-grid">
                  <label>
                    Quantity
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      value={composer.quantity}
                      onChange={handleComposerChange}
                    />
                  </label>
                  <label>
                    Delivery method
                    <select
                      name="delivery"
                      value={composer.delivery}
                      onChange={handleComposerChange}
                    >
                      <option value="home">Home delivery</option>
                      <option value="pickup">Store pickup</option>
                    </select>
                  </label>
                </div>
                <label>
                  Preferred pharmacy
                  <select
                    name="pharmacyId"
                    value={composer.pharmacyId}
                    onChange={handleComposerChange}
                  >
                    {pharmacySeed.map((pharmacy) => (
                      <option key={pharmacy.id} value={pharmacy.id}>
                        {pharmacy.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Notes
                  <textarea
                    name="notes"
                    rows="3"
                    placeholder="Add courier instructions"
                    value={composer.notes}
                    onChange={handleComposerChange}
                  />
                </label>
                <button className="primary-btn" type="submit">
                  Submit request
                </button>
              </form>
            ) : (
              <div className="composer-placeholder">
                <p>
                  Draft refills, choose pharmacies, and trigger adherence
                  workflows without leaving this panel.
                </p>
                <ul>
                  <li>• Pre-fill quantities from medication inventory.</li>
                  <li>• Route urgent orders to express pharmacies.</li>
                  <li>• Attach courier instructions for doorstep delivery.</li>
                </ul>
              </div>
            )}
          </section>

          <section className="secondary-card automation-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Automation</p>
                <h3>Care programs</h3>
              </div>
              <button
                className="ghost-btn"
                onClick={() => alert("Opening automation settings…")}
              >
                Configure
              </button>
            </div>
            <ul className="automation-list">
              {automationPrograms.map((program) => (
                <li key={program.id}>
                  <div>
                    <h4>{program.title}</h4>
                    <p>{program.detail}</p>
                  </div>
                  <span
                    className={`status-pill status-pill--${program.status === "active" ? "success" : "muted"}`}
                  >
                    {program.status === "active" ? "Active" : "Paused"}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="secondary-card pharmacy-spotlight">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Network</p>
                <h3>Pharmacy spotlights</h3>
              </div>
              <button
                className="ghost-btn"
                onClick={() => alert("Opening pharmacy map…")}
              >
                View map
              </button>
            </div>
            <ul className="pharmacy-list">
              {pharmacySeed.slice(0, 2).map((pharmacy) => (
                <li key={pharmacy.id}>
                  <div>
                    <h4>{pharmacy.name}</h4>
                    <p>
                      ⭐ {pharmacy.rating} · {pharmacy.deliveryTime}
                    </p>
                    <p>{pharmacy.savings}</p>
                  </div>
                  <span className="muted">{pharmacy.distance}</span>
                </li>
              ))}
            </ul>
          </section>

          {criticalInventory.length > 0 && (
            <section className="secondary-card risk-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Risk</p>
                  <h3>Needs attention</h3>
                </div>
                <button
                  className="ghost-btn"
                  onClick={() => setComposerOpen(true)}
                >
                  Queue all
                </button>
              </div>
              <ul>
                {criticalInventory.map((item) => (
                  <li key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <p>
                        {item.daysLeft} days left · needs refill by{" "}
                        {item.nextRefill}
                      </p>
                    </div>
                    <button
                      className="danger-btn"
                      onClick={() => {
                        setComposer((prev) => ({
                          ...prev,
                          medicationId: item.id,
                        }));
                        setComposerOpen(true);
                      }}
                    >
                      Plan refill
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </section>
  );

  return embedded ? (
    <div className="refill-embedded">{workspace}</div>
  ) : (
    <div className="refill-route">{workspace}</div>
  );
};

export default MedicationRefill;
