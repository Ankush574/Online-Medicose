import React, { useState, useEffect, useMemo } from "react";
import "./Appointments.css";

const seedAppointments = [
  {
    id: 1,
    doctor: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    date: "2026-01-10",
    time: "10:00 AM",
    reason: "Regular checkup",
    status: "upcoming",
    notes: "Patient reports mild chest pain",
    patientName: "John Doe",
    patientAge: 45,
    type: "patient"
  },
  {
    id: 2,
    doctor: "Dr. Michael Chen",
    specialty: "Dermatologist",
    date: "2026-01-05",
    time: "2:30 PM",
    reason: "Skin rash consultation",
    status: "completed",
    notes: "Prescribed antihistamine cream",
    patientName: "John Doe",
    patientAge: 45,
    type: "patient"
  }
];

const viewOptions = {
  patient: { label: "Patient", helper: "Personal visits" },
  doctor: { label: "Doctor", helper: "Clinician console" },
  caretaker: { label: "Caretaker", helper: "Manage loved ones" }
};

const prepChecklistSeed = [
  { id: "labs", label: "Upload latest labs", detail: "CBC + lipid panel", done: false },
  { id: "symptoms", label: "Log current symptoms", detail: "Energy, sleep, appetite", done: true },
  { id: "questions", label: "Pin 3 discussion topics", detail: "Meds, vitals, triggers", done: false },
  { id: "docs", label: "Share new documents", detail: "Insurance + pharmacy card", done: true }
];

const careTeamAvailability = [
  {
    id: "dr-johnson",
    doctor: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    mode: "In-person",
    window: "10:00 AM - 12:00 PM",
    slots: 2
  },
  {
    id: "dr-chen",
    doctor: "Dr. Michael Chen",
    specialty: "Dermatology",
    mode: "Video",
    window: "02:00 PM - 04:00 PM",
    slots: 3
  },
  {
    id: "coach-lia",
    doctor: "Care coach Lia",
    specialty: "Care Navigator",
    mode: "Chat",
    window: "All day",
    slots: 5
  }
];

const Appointments = ({ embedded = false }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarView, setCalendarView] = useState(false);
  const [viewMode, setViewMode] = useState("patient"); // patient, doctor, caretaker
  const [bookingData, setBookingData] = useState({
    doctor: "",
    specialty: "",
    date: "",
    time: "",
    reason: "",
    notes: "",
    patientName: "",
    patientAge: ""
  });
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedAppointmentForPrescription, setSelectedAppointmentForPrescription] = useState(null);
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prepTasks, setPrepTasks] = useState(prepChecklistSeed);

  useEffect(() => {
    const stored = localStorage.getItem("appointments");
    const initialData = stored ? JSON.parse(stored) : seedAppointments;
    setAppointments(initialData);
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("appointments", JSON.stringify(appointments));
  }, [appointments]);

  const doctors = [
    { name: "Dr. Sarah Johnson", specialty: "Cardiologist" },
    { name: "Dr. Michael Chen", specialty: "Dermatologist" },
    { name: "Dr. Emily Davis", specialty: "Neurologist" },
    { name: "Dr. Robert Wilson", specialty: "Orthopedic" },
    { name: "Dr. Lisa Brown", specialty: "Gynecologist" }
  ];

  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"
  ];

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData({ ...bookingData, [name]: value });
  };

  const handleBookAppointment = (e) => {
    e.preventDefault();
    const newAppointment = {
      id: Date.now(),
      ...bookingData,
      status: "upcoming",
      type: viewMode
    };
    setAppointments([newAppointment, ...appointments]);
    setBookingData({
      doctor: "",
      specialty: "",
      date: "",
      time: "",
      reason: "",
      notes: "",
      patientName: "",
      patientAge: ""
    });
    setShowBookingForm(false);
  };

  const handleCancelAppointment = (id) => {
    setAppointments(appointments.map(apt =>
      apt.id === id ? { ...apt, status: "cancelled" } : apt
    ));
  };

  const handleRescheduleAppointment = (id) => {
    const appointment = appointments.find(apt => apt.id === id);
    setSelectedAppointment(appointment);
    setBookingData({
      doctor: appointment.doctor,
      specialty: appointment.specialty,
      date: appointment.date,
      time: appointment.time,
      reason: appointment.reason,
      notes: appointment.notes,
      patientName: appointment.patientName,
      patientAge: appointment.patientAge
    });
    setShowBookingForm(true);
  };

  const handleUpdateAppointment = (e) => {
    e.preventDefault();
    setAppointments(appointments.map(apt =>
      apt.id === selectedAppointment.id
        ? { ...apt, ...bookingData, status: "upcoming" }
        : apt
    ));
    setSelectedAppointment(null);
    setBookingData({
      doctor: "",
      specialty: "",
      date: "",
      time: "",
      reason: "",
      notes: "",
      patientName: "",
      patientAge: ""
    });
    setShowBookingForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming": return "#10b981";
      case "completed": return "#3b82f6";
      case "cancelled": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const todayISO = new Date().toISOString().split('T')[0];
  const upcomingAppointments = appointments.filter(apt => apt.status === "upcoming");
  const todayAppointments = appointments.filter(apt => apt.date === todayISO && apt.status === "upcoming");
  const statsCards = [
    { id: "upcoming", label: "Upcoming", icon: "📅", value: upcomingAppointments.length, meta: "Next 30 days" },
    { id: "today", label: "Today", icon: "⏰", value: todayAppointments.length, meta: "Scheduled for today" },
    { id: "total", label: "Total", icon: "📊", value: appointments.length, meta: "All visits" }
  ];

  const parseAppointmentDate = (appointment) => {
    const parsed = new Date(`${appointment.date} ${appointment.time}`);
    return Number.isNaN(parsed.getTime()) ? new Date(appointment.date) : parsed;
  };

  const nextAppointment = upcomingAppointments.length
    ? [...upcomingAppointments].sort((a, b) => parseAppointmentDate(a) - parseAppointmentDate(b))[0]
    : null;

  const appointmentListTitle = viewMode === "doctor"
    ? "Today's Appointments"
    : viewMode === "caretaker"
      ? "Patient Appointments"
      : "My Appointments";

  const skeletonPlaceholders = Array.from({ length: 3 }, (_, index) => index);
  const completedPrep = useMemo(
    () => prepTasks.filter(task => task.done).length,
    [prepTasks]
  );
  const readinessPercent = prepTasks.length
    ? Math.round((completedPrep / prepTasks.length) * 100)
    : 0;

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const getAppointmentsForDate = (date) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateString);
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleUploadPrescription = (appointment) => {
    setSelectedAppointmentForPrescription(appointment);
    setShowPrescriptionModal(true);
  };

  const handlePrescriptionFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPrescriptionFile(file);
    }
  };

  const handlePrescriptionSubmit = (e) => {
    e.preventDefault();
    if (prescriptionFile && selectedAppointmentForPrescription) {
      const fileURL = URL.createObjectURL(prescriptionFile);
      // Update appointment with prescription
      setAppointments(appointments.map(apt =>
        apt.id === selectedAppointmentForPrescription.id
          ? { ...apt, prescription: { name: prescriptionFile.name, url: fileURL } }
          : apt
      ));
      alert("Prescription uploaded successfully!");
      setPrescriptionFile(null);
      setShowPrescriptionModal(false);
      setSelectedAppointmentForPrescription(null);
    } else {
      alert("Please select a file to upload.");
    }
  };

  const renderCalendarView = () => (
    <div className="calendar-section">
      <div className="calendar-header">
        <div>
          <p className="eyebrow">Schedule</p>
          <h2>Calendar View</h2>
        </div>
        <div className="calendar-controls">
          <button onClick={() => navigateMonth(-1)} className="nav-btn" aria-label="Previous month">‹</button>
          <h3>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
          <button onClick={() => navigateMonth(1)} className="nav-btn" aria-label="Next month">›</button>
        </div>
      </div>

      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}

        {getDaysInMonth(currentDate).map((date, index) => {
          const dayAppointments = getAppointmentsForDate(date);
          return (
            <div
              key={index}
              className={`calendar-day ${!date ? 'empty' : ''} ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''}`}
              onClick={() => date && setSelectedDate(date)}
            >
              {date && (
                <>
                  <span className="day-number">{date.getDate()}</span>
                  {dayAppointments.length > 0 && (
                    <div className="appointment-indicators">
                      {dayAppointments.slice(0, 3).map((apt, i) => (
                        <div
                          key={i}
                          className={`appointment-dot ${apt.status}`}
                          title={`${apt.doctor} - ${apt.time}`}
                        />
                      ))}
                      {dayAppointments.length > 3 && (
                        <span className="more-appointments">+{dayAppointments.length - 3}</span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div className="selected-date-details">
          <h3>{formatDate(selectedDate)}</h3>
          <div className="date-appointments">
            {getAppointmentsForDate(selectedDate).length === 0 ? (
              <p>No appointments scheduled for this date.</p>
            ) : (
              getAppointmentsForDate(selectedDate).map(appointment => (
                <div key={appointment.id} className={`mini-appointment-card ${appointment.status}`}>
                  <div className="mini-appointment-info">
                    <h4>{appointment.doctor}</h4>
                    <p>{appointment.specialty}</p>
                    <p><strong>Time:</strong> {appointment.time}</p>
                    <p><strong>Reason:</strong> {appointment.reason}</p>
                    {(viewMode === "doctor" || viewMode === "caretaker") && (
                      <p><strong>Patient:</strong> {appointment.patientName}, Age: {appointment.patientAge}</p>
                    )}
                  </div>
                  <div className="mini-appointment-status">
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(appointment.status) }}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderAppointmentsList = () => (
    <div className="appointments-list">
      <div className="list-heading">
        <p className="eyebrow">{viewOptions[viewMode].helper}</p>
        <h2>{appointmentListTitle}</h2>
      </div>

      {loading ? (
        <div className="skeleton-stack">
          {skeletonPlaceholders.map((id) => (
            <div key={`skeleton-${id}`} className="appointment-card skeleton-card shimmer" aria-hidden></div>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-illustration" aria-hidden>🩺</div>
          <h3>No appointments yet</h3>
          <p>Book your first visit to stay on track with your health.</p>
          <button className="primary-cta" onClick={() => { setSelectedAppointment(null); setShowBookingForm(true); }}>
            ➕ Book Appointment
          </button>
        </div>
      ) : (
        appointments.map(appointment => (
          <div key={appointment.id} className={`appointment-card ${appointment.status}`}>
            <div className="appointment-card__header">
              <div className="appointment-card__identity">
                <div className="avatar-chip" aria-hidden>
                  {appointment.doctor.split(' ').map(part => part[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <h3>{appointment.doctor}</h3>
                  <p>{appointment.specialty}</p>
                </div>
              </div>
              <div className="appointment-card__status">
                <span className="status-chip" style={{ backgroundColor: getStatusColor(appointment.status) }}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
                <p className="appointment-card__time">{appointment.date} • {appointment.time}</p>
              </div>
            </div>

            <div className="appointment-card__body">
              <p><strong>Reason:</strong> {appointment.reason}</p>
              {appointment.notes && <p><strong>Notes:</strong> {appointment.notes}</p>}
              {(viewMode === "doctor" || viewMode === "caretaker") && (
                <p><strong>Patient:</strong> {appointment.patientName}, Age: {appointment.patientAge}</p>
              )}
            </div>

            <div className="appointment-card__actions">
              {appointment.status === "upcoming" && viewMode !== "doctor" && (
                <>
                  <button
                    className="ghost-btn"
                    onClick={() => handleRescheduleAppointment(appointment.id)}
                  >
                    Reschedule
                  </button>
                  <button className="danger-btn" onClick={() => handleCancelAppointment(appointment.id)}>
                    Cancel
                  </button>
                </>
              )}

              {appointment.status === "completed" && (
                <>
                  <button className="ghost-btn" onClick={() => handleUploadPrescription(appointment)}>
                    Upload Prescription
                  </button>
                  <button className="ghost-btn">Video Consultation</button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderStats = () => (
    <div className="stats-grid">
      {loading
        ? skeletonPlaceholders.map((id) => (
            <div key={`stat-skeleton-${id}`} className="stat-card skeleton-card shimmer" aria-hidden></div>
          ))
        : statsCards.map((card) => (
            <div key={card.id} className="stat-card">
              <div className="stat-icon">{card.icon}</div>
              <div>
                <p className="stat-label">{card.label}</p>
                <p className="stat-value">{card.value}</p>
                <p className="stat-meta">{card.meta}</p>
              </div>
            </div>
          ))}
    </div>
  );

  const togglePrepTask = (taskId) => {
    setPrepTasks(tasks =>
      tasks.map(task => (task.id === taskId ? { ...task, done: !task.done } : task))
    );
  };

  const renderReadinessBoard = () => (
    <div className="appointments-intel-grid">
      <section className="prep-card">
        <div className="prep-card__header">
          <div>
            <p className="eyebrow">Visit prep</p>
            <h3>Pre-visit checklist</h3>
          </div>
          <div className="prep-progress" aria-label="Preparation progress">
            <div className="prep-progress__rail">
              <div className="prep-progress__fill" style={{ width: `${readinessPercent}%` }} />
            </div>
            <span>{readinessPercent}% ready</span>
          </div>
        </div>
        <ul className="prep-task-list">
          {prepTasks.map(task => (
            <li key={task.id}>
              <label>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => togglePrepTask(task.id)}
                  aria-label={task.label}
                />
                <div>
                  <strong>{task.label}</strong>
                  <p>{task.detail}</p>
                </div>
              </label>
            </li>
          ))}
        </ul>
      </section>
      <section className="availability-card">
        <div className="availability-card__header">
          <div>
            <p className="eyebrow">Care team grid</p>
            <h3>Real-time availability</h3>
          </div>
          <button className="ghost-btn" onClick={() => setCalendarView(true)}>
            Open calendar
          </button>
        </div>
        <ul className="availability-list">
          {careTeamAvailability.map(slot => (
            <li key={slot.id}>
              <div>
                <strong>{slot.doctor}</strong>
                <p>{slot.specialty} • {slot.mode}</p>
              </div>
              <div className="availability-meta">
                <span>{slot.window}</span>
                <span className="slot-chip">{slot.slots} slots</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );

  const renderModals = () => (
    <>
      {showBookingForm && (
        <div className="booking-modal">
          <div className="booking-form-container">
            <h2>{selectedAppointment ? "Reschedule Appointment" : "Book New Appointment"}</h2>
            <form onSubmit={selectedAppointment ? handleUpdateAppointment : handleBookAppointment}>
              {(viewMode === "caretaker" || viewMode === "doctor") && (
                <>
                  <label>
                    Patient Name
                    <input
                      type="text"
                      name="patientName"
                      value={bookingData.patientName}
                      onChange={handleBookingChange}
                      required
                    />
                  </label>
                  <label>
                    Patient Age
                    <input
                      type="number"
                      name="patientAge"
                      value={bookingData.patientAge}
                      onChange={handleBookingChange}
                      required
                    />
                  </label>
                </>
              )}

              <label>
                Doctor
                <select
                  name="doctor"
                  value={bookingData.doctor}
                  onChange={(e) => {
                    const selectedDoctor = doctors.find(d => d.name === e.target.value);
                    setBookingData({
                      ...bookingData,
                      doctor: e.target.value,
                      specialty: selectedDoctor ? selectedDoctor.specialty : ""
                    });
                  }}
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doctor, index) => (
                    <option key={index} value={doctor.name}>
                      {doctor.name} - {doctor.specialty}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Date
                <input
                  type="date"
                  name="date"
                  value={bookingData.date}
                  onChange={handleBookingChange}
                  min={todayISO}
                  required
                />
              </label>

              <label>
                Time
                <select
                  name="time"
                  value={bookingData.time}
                  onChange={handleBookingChange}
                  required
                >
                  <option value="">Select Time</option>
                  {timeSlots.map((slot, index) => (
                    <option key={index} value={slot}>{slot}</option>
                  ))}
                </select>
              </label>

              <label>
                Reason
                <input
                  type="text"
                  name="reason"
                  value={bookingData.reason}
                  onChange={handleBookingChange}
                  placeholder="e.g., Regular checkup, Consultation"
                  required
                />
              </label>

              <label>
                Notes
                <textarea
                  name="notes"
                  value={bookingData.notes}
                  onChange={handleBookingChange}
                  placeholder="Additional notes..."
                />
              </label>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {selectedAppointment ? "Update Appointment" : "Book Appointment"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowBookingForm(false);
                    setSelectedAppointment(null);
                    setBookingData({
                      doctor: "",
                      specialty: "",
                      date: "",
                      time: "",
                      reason: "",
                      notes: "",
                      patientName: "",
                      patientAge: ""
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPrescriptionModal && (
        <div className="booking-modal">
          <div className="booking-form-container">
            <h2>Upload Prescription</h2>
            <p className="modal-info">
              Appointment: {selectedAppointmentForPrescription?.doctor} - {selectedAppointmentForPrescription?.date} {selectedAppointmentForPrescription?.time}
            </p>
            <form onSubmit={handlePrescriptionSubmit}>
              <label>
                Select Prescription File (PDF, JPG, PNG)
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handlePrescriptionFileChange}
                  required
                />
              </label>
              {prescriptionFile && (
                <p className="file-info">Selected file: {prescriptionFile.name}</p>
              )}
              <div className="form-actions">
                <button type="submit" className="submit-btn">Upload Prescription</button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowPrescriptionModal(false);
                    setPrescriptionFile(null);
                    setSelectedAppointmentForPrescription(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );

  const renderAppointmentsSurface = () => {
    const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const activeView = viewOptions[viewMode];

    return (
      <div className="appointments-shell">
        <div className="appointments-container">
          <header className="appointments-lede">
            <div>
              <p className="page-breadcrumb">Appointments / Doctor Appointments</p>
              <div className="lede-title">
                <h1>Doctor Appointments</h1>
                <p>Manage and track all your medical visits</p>
              </div>
            </div>
            <div className="lede-date-card">
              <p>Today</p>
              <strong>{todayLabel}</strong>
            </div>
          </header>

          <div className="segmented-wrapper">
            <div className="segmented-control" role="tablist">
              {Object.entries(viewOptions).map(([key, option]) => (
                <button
                  key={key}
                  className={`segment-btn ${viewMode === key ? 'active' : ''}`}
                  onClick={() => setViewMode(key)}
                  role="tab"
                  aria-selected={viewMode === key}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="view-hint">Currently viewing as <span>{activeView.label}</span> · {activeView.helper}</p>
          </div>

          <div className="appointments-content">
            {renderStats()}

            <div className="cta-row">
              <button
                className="primary-cta"
                onClick={() => {
                  setSelectedAppointment(null);
                  setShowBookingForm(true);
                }}
              >
                ➕ Book Appointment
              </button>
              <button
                className="secondary-cta"
                onClick={() => setCalendarView((prev) => !prev)}
              >
                {calendarView ? '📋 List View' : '📆 Calendar View'}
              </button>
            </div>

            {nextAppointment && (
              <div className="next-appointment-card">
                <div>
                  <p className="eyebrow">Next appointment</p>
                  <h3>{nextAppointment.doctor}</h3>
                  <p>{nextAppointment.date} • {nextAppointment.time}</p>
                  <p className="next-appointment-meta">{nextAppointment.reason}</p>
                </div>
                <div className="next-appointment-actions">
                  <span className="chip">{nextAppointment.specialty}</span>
                  {viewMode !== "doctor" && (
                    <button className="ghost-btn" onClick={() => handleRescheduleAppointment(nextAppointment.id)}>
                      Reschedule
                    </button>
                  )}
                </div>
              </div>
            )}

            {calendarView ? renderCalendarView() : renderAppointmentsList()}

            {renderReadinessBoard()}
          </div>
        </div>

        {renderModals()}
      </div>
    );
  };

  const content = renderAppointmentsSurface();

  if (embedded) {
    return <div className="appointments-embedded">{content}</div>;
  }

  return <div className="appointments-standalone">{content}</div>;
};

export default Appointments;