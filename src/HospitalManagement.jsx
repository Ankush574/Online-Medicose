import React, { useState } from "react";
import { hospitals, doctors } from "./hospitalData";

function HospitalDetails({ hospital }) {
  if (!hospital) return <div>Select a hospital to view details.</div>;
  return (
    <div>
      <h2>{hospital.name}</h2>
      <p>Address: {hospital.address}</p>
      <p>Contact: {hospital.contact}</p>
      <h3>Doctors</h3>
      <ul>
        {hospital.doctors.map((docId) => {
          const doc = doctors.find((d) => d.id === docId);
          return doc ? (
            <li key={doc.id}>{doc.name} ({doc.specialty})</li>
          ) : null;
        })}
      </ul>
      <button style={{marginTop: '1em'}} onClick={() => alert('Booking feature coming soon!')}>Book Appointment</button>
    </div>
  );
}

export default function HospitalManagement() {
  const [selectedHospital, setSelectedHospital] = useState(null);
  return (
    <div>
      <HospitalList onSelectHospital={setSelectedHospital} />
      <HospitalDetails hospital={selectedHospital} />
    </div>
  );
}

export function HospitalList({ onSelectHospital }) {
  return (
    <div>
      <h2>Hospitals</h2>
      <ul>
        {hospitals.map((hospital) => (
          <li key={hospital.id}>
            <button onClick={() => onSelectHospital(hospital)}>
              {hospital.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HospitalRegistration({ onRegister }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onRegister({ name, address, contact });
    setName("");
    setAddress("");
    setContact("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register Hospital</h2>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
      <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Address" required />
      <input value={contact} onChange={e => setContact(e.target.value)} placeholder="Contact" required />
      <button type="submit">Register</button>
    </form>
  );
}

export function DoctorAssignment({ hospital }) {
  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  function handleAssign() {
    // Assignment logic placeholder
    alert(`Doctor ${selectedDoctorId} assigned to ${hospital.name}`);
  }

  return (
    <div>
      <h3>Assign Doctor to {hospital.name}</h3>
      <select value={selectedDoctorId} onChange={e => setSelectedDoctorId(e.target.value)}>
        <option value="">Select Doctor</option>
        {doctors.map((doc) => (
          <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialty})</option>
        ))}
      </select>
      <button onClick={handleAssign} disabled={!selectedDoctorId}>Assign</button>
    </div>
  );
}
