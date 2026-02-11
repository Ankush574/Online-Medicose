import React, { useMemo, useState } from "react";
import { hospitals as seedHospitals, doctors as seedDoctors } from "./hospitalData";
import "./HospitalManagement.css";

const keyMetrics = (network) => ([
  { id: "network", label: "Hospitals in network", value: network.length, meta: "+2 onboarding" },
  { id: "doctors", label: "Doctors available", value: seedDoctors.length, meta: "10 specialties" },
  { id: "icu", label: "Avg. ICU occupancy", value: "78%", meta: "vs 82% last week" },
  { id: "satisfaction", label: "Patient satisfaction", value: "4.8/5", meta: "based on 340 surveys" }
]);

const occupancySnapshots = [
  { id: "emergency", label: "Emergency triage", value: "12 min", status: "avg wait" },
  { id: "surgery", label: "OR utilization", value: "64%", status: "next slot 2 PM" },
  { id: "beds", label: "Beds available", value: "112", status: "city-wide" }
];

export default function HospitalManagement({ embedded = false }) {
  const [network, setNetwork] = useState(seedHospitals);
  const [selectedHospital, setSelectedHospital] = useState(seedHospitals[0] || null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHospitals = useMemo(() => {
    return network.filter((hospital) => {
      const haystack = `${hospital.name} ${hospital.address}`.toLowerCase();
      return haystack.includes(searchTerm.toLowerCase());
    });
  }, [network, searchTerm]);

  const handleRegister = ({ name, address, contact }) => {
    const newHospital = {
      id: Date.now(),
      name,
      address,
      contact,
      doctors: []
    };
    setNetwork([newHospital, ...network]);
    setSelectedHospital(newHospital);
  };

  const handleAssignDoctor = (doctorId) => {
    if (!doctorId || !selectedHospital) return;
    const numericId = Number(doctorId);
    if (selectedHospital.doctors.includes(numericId)) return;

    const updatedNetwork = network.map((hospital) =>
      hospital.id === selectedHospital.id
        ? { ...hospital, doctors: [...hospital.doctors, numericId] }
        : hospital
    );
    setNetwork(updatedNetwork);
    const refreshedSelection = updatedNetwork.find((h) => h.id === selectedHospital.id);
    setSelectedHospital(refreshedSelection || null);
  };

  const renderWorkspace = () => (
    <section className="hospital-management">
      <header className="hospital-hero">
        <div>
          <p className="eyebrow">Care network</p>
          <h1>Hospital Management</h1>
          <p className="subcopy">Monitor partner capacity, assign specialists, and onboard new sites in minutes.</p>
        </div>
        <div className="hero-actions">
          <button className="ghost-btn" onClick={() => alert("Syncing live census")}>Refresh census</button>
          <button className="primary-btn" onClick={() => setSelectedHospital(filteredHospitals[0] || null)}>
            View top performer
          </button>
        </div>
      </header>

      <section className="hospital-metrics">
        {keyMetrics(network).map((metric) => (
          <article key={metric.id} className="hospital-metric-card">
            <p className="metric-label">{metric.label}</p>
            <p className="metric-value">{metric.value}</p>
            <p className="metric-meta">{metric.meta}</p>
          </article>
        ))}
      </section>

      <section className="hospital-search-panel">
        <div>
          <label htmlFor="hospital-search">Search network</label>
          <input
            id="hospital-search"
            type="text"
            placeholder="Search by hospital or city"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="pill-filters">
          {['Critical care', 'Surgery', 'Diagnostics'].map((tag) => (
            <span key={tag} className="pill">{tag}</span>
          ))}
        </div>
        <p className="filter-meta">{filteredHospitals.length} facilities match your filters</p>
      </section>

      <div className="hospital-layout">
        <div className="hospital-list-card">
          <div className="card-header">
            <h2>Network snapshot</h2>
            <p>Select a facility to drill into operations</p>
          </div>
          <HospitalList
            hospitals={filteredHospitals}
            selectedId={selectedHospital?.id}
            onSelectHospital={setSelectedHospital}
          />
        </div>

        <div className="hospital-detail-card">
          <HospitalDetails hospital={selectedHospital} doctors={seedDoctors} />
        </div>
      </div>

      <section className="hospital-operations-grid">
        <HospitalRegistration onRegister={handleRegister} />
        <DoctorAssignment hospital={selectedHospital} doctors={seedDoctors} onAssign={handleAssignDoctor} />
        <div className="occupancy-card">
          <h3>Capacity pulse</h3>
          <div className="occupancy-grid">
            {occupancySnapshots.map((snapshot) => (
              <article key={snapshot.id}>
                <p className="metric-label">{snapshot.label}</p>
                <p className="metric-value">{snapshot.value}</p>
                <p className="metric-meta">{snapshot.status}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </section>
  );

  if (embedded) {
    return (
      <div className="hospital-widget">
        <h3>Hospital Network</h3>
        <p>{network.length} sites • {seedDoctors.length} doctors</p>
        <p className="widget-meta">Next onboarding call: City Hospital East</p>
      </div>
    );
  }

  return renderWorkspace();
}

export function HospitalList({ hospitals, selectedId, onSelectHospital }) {
  if (!hospitals.length) {
    return <p className="empty-state">No hospitals match your filters.</p>;
  }

  return (
    <ul className="hospital-list">
      {hospitals.map((hospital) => (
        <li key={hospital.id}>
          <button
            className={`hospital-card ${selectedId === hospital.id ? "active" : ""}`}
            onClick={() => onSelectHospital(hospital)}
          >
            <div>
              <p className="hospital-name">{hospital.name}</p>
              <p className="hospital-meta">{hospital.address}</p>
            </div>
            <span className="capacity-chip">{hospital.doctors.length} doctors</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function HospitalDetails({ hospital, doctors }) {
  if (!hospital) {
    return <div className="empty-state">Select a hospital to view occupancy and roster.</div>;
  }

  const attendingDoctors = hospital.doctors
    .map((docId) => doctors.find((doc) => doc.id === docId))
    .filter(Boolean);

  return (
    <div className="hospital-details">
      <div className="details-header">
        <h2>{hospital.name}</h2>
        <span className="status-pill">Live</span>
      </div>
      <p className="hospital-meta">{hospital.address}</p>
      <p className="hospital-meta">{hospital.contact}</p>
      <div className="details-grid">
        <article>
          <p className="metric-label">Departments</p>
          <p className="metric-value">8 active</p>
        </article>
        <article>
          <p className="metric-label">Available beds</p>
          <p className="metric-value">32</p>
        </article>
        <article>
          <p className="metric-label">Next audit</p>
          <p className="metric-value">Mar 14</p>
        </article>
      </div>
      <div className="doctor-roster">
        <h3>Assigned doctors</h3>
        {attendingDoctors.length === 0 ? (
          <p className="empty-state">No doctors assigned yet.</p>
        ) : (
          <ul>
            {attendingDoctors.map((doc) => (
              <li key={doc.id}>
                <span>{doc.name}</span>
                <small>{doc.specialty}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button className="primary-btn" onClick={() => alert("Booking feature coming soon")}>Book appointment slot</button>
    </div>
  );
}

export function HospitalRegistration({ onRegister }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister({ name, address, contact });
    setName("");
    setAddress("");
    setContact("");
  };

  return (
    <form className="hospital-form" onSubmit={handleSubmit}>
      <h3>Register hospital</h3>
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label>
        Address
        <input value={address} onChange={(e) => setAddress(e.target.value)} required />
      </label>
      <label>
        Contact
        <input value={contact} onChange={(e) => setContact(e.target.value)} required />
      </label>
      <button type="submit" className="primary-btn">Add to network</button>
    </form>
  );
}

export function DoctorAssignment({ hospital, doctors, onAssign }) {
  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  const assignDoctor = () => {
    onAssign(selectedDoctorId);
    setSelectedDoctorId("");
  };

  return (
    <div className="hospital-form">
      <h3>Assign specialists</h3>
      {hospital ? (
        <>
          <p className="form-meta">Assign a doctor to {hospital.name}</p>
          <select value={selectedDoctorId} onChange={(e) => setSelectedDoctorId(e.target.value)}>
            <option value="">Select doctor</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialty})</option>
            ))}
          </select>
          <button type="button" className="ghost-btn" onClick={assignDoctor} disabled={!selectedDoctorId}>
            Assign doctor
          </button>
        </>
      ) : (
        <p className="empty-state">Choose a hospital to begin assignments.</p>
      )}
    </div>
  );
}
