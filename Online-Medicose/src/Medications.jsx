import React, { useMemo, useState } from "react";
import "./Medications.css";

const baseMedication = {
	drugName: "",
	strength: "",
	dosageForm: "",
	isGeneric: false,
	dosage: "",
	frequency: "",
	medicationTimes: [],
	refillReminder: "",
	startDate: "",
	endDate: "",
	inventory: 30
};

const medicationSeed = [
	{
		id: 1,
		drugName: "Metformin",
		strength: "500mg",
		dosageForm: "Tablet",
		isGeneric: true,
		dosage: "1 tablet",
		frequency: "daily",
		medicationTimes: ["08:00", "20:00"],
		refillReminder: "7",
		startDate: "2026-01-03",
		endDate: "2026-03-03",
		inventory: 18
	},
	{
		id: 2,
		drugName: "Amlodipine",
		strength: "5mg",
		dosageForm: "Tablet",
		isGeneric: false,
		dosage: "1 tablet",
		frequency: "daily",
		medicationTimes: ["09:00"],
		refillReminder: "5",
		startDate: "2025-12-22",
		endDate: "2026-02-22",
		inventory: 6
	},
	{
		id: 3,
		drugName: "Budesonide",
		strength: "200mcg",
		dosageForm: "Inhaler",
		isGeneric: true,
		dosage: "2 puffs",
		frequency: "as-needed",
		medicationTimes: [],
		refillReminder: "3",
		startDate: "2025-11-18",
		endDate: "2026-01-18",
		inventory: 12
	}
];

const guidanceTips = [
	{ id: "hydrate", icon: "💧", title: "Hydrate", detail: "Drink a glass of water with every morning dose." },
	{ id: "log", icon: "📝", title: "Log symptoms", detail: "Note how you feel 30 minutes after medications." },
	{ id: "refill", icon: "🔔", title: "Refill window", detail: "Schedule refills 5 days before running out." }
];

const frequencyOptions = [
	{ value: "daily", label: "Daily" },
	{ value: "weekly", label: "Weekly" },
	{ value: "monthly", label: "Monthly" },
	{ value: "as-needed", label: "As needed" }
];

const dosageForms = ["Tablet", "Capsule", "Syrup", "Injection", "Inhaler"];

const Medications = ({ embedded = false }) => {
	const [medications, setMedications] = useState(medicationSeed);
	const [isComposerOpen, setIsComposerOpen] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [newMedication, setNewMedication] = useState(baseMedication);
	const [errors, setErrors] = useState({});
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);

	const handleChange = (event) => {
		const { name, value, type, checked } = event.target;
		setNewMedication((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value
		}));
		setErrors((prev) => ({ ...prev, [name]: "" }));
		setSuccess("");
	};

	const addTime = () => {
		setNewMedication((prev) => ({
			...prev,
			medicationTimes: [...prev.medicationTimes, ""]
		}));
	};

	const updateTime = (index, value) => {
		setNewMedication((prev) => {
			const next = [...prev.medicationTimes];
			next[index] = value;
			return { ...prev, medicationTimes: next };
		});
	};

	const removeTime = (index) => {
		setNewMedication((prev) => ({
			...prev,
			medicationTimes: prev.medicationTimes.filter((_, timeIndex) => timeIndex !== index)
		}));
	};

	const validateMedication = () => {
		const validationErrors = {};
		if (!newMedication.drugName.trim()) {
			validationErrors.drugName = "Medication name is required.";
		}
		if (!newMedication.dosage.trim()) {
			validationErrors.dosage = "Dosage instructions are required.";
		}
		if (!newMedication.frequency) {
			validationErrors.frequency = "Select a frequency.";
		}
		if (!newMedication.startDate) {
			validationErrors.startDate = "Start date is required.";
		}
		if (newMedication.endDate && new Date(newMedication.endDate) <= new Date(newMedication.startDate)) {
			validationErrors.endDate = "End date must be after the start date.";
		}
		if (newMedication.inventory < 0) {
			validationErrors.inventory = "Inventory cannot be negative.";
		}
		setErrors(validationErrors);
		return Object.keys(validationErrors).length === 0;
	};

	const resetComposer = () => {
		setNewMedication(baseMedication);
		setEditingId(null);
		setIsComposerOpen(false);
		setErrors({});
	};

	const handleSaveMedication = async (event) => {
		event.preventDefault();
		if (!validateMedication()) return;
		setLoading(true);
		await new Promise((resolve) => setTimeout(resolve, 600));

		setMedications((prev) => {
			if (editingId) {
				return prev.map((med) => (med.id === editingId ? { ...newMedication, id: editingId } : med));
			}
			return [{ ...newMedication, id: Date.now() }, ...prev];
		});

		setSuccess(editingId ? "Medication updated." : "Medication added.");
		setLoading(false);
		resetComposer();
	};

	const handleEditMedication = (medication) => {
		setNewMedication({
			...medication,
			medicationTimes: medication.medicationTimes || []
		});
		setEditingId(medication.id);
		setIsComposerOpen(true);
		setErrors({});
		setSuccess("");
	};

	const handleDeleteMedication = (id) => {
		if (window.confirm("Remove this medication from your regimen?")) {
			setMedications((prev) => prev.filter((med) => med.id !== id));
			setSuccess("Medication removed.");
		}
	};

	const lowStockMedications = useMemo(
		() => medications.filter((med) => (med.inventory ?? 0) <= 10),
		[medications]
	);

	const upcomingRefills = useMemo(() => {
		const dated = medications.filter((med) => med.endDate);
		return dated
			.sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
			.slice(0, 3);
	}, [medications]);

	const scheduleBlocks = useMemo(() => {
		const blocks = medications.flatMap((med) =>
			(med.medicationTimes || []).map((time, index) => ({
				id: `${med.id}-${index}`,
				time,
				drugName: med.drugName,
				dosage: med.dosage || med.strength,
				frequency: med.frequency
			}))
		);
		return blocks.sort((a, b) => a.time.localeCompare(b.time));
	}, [medications]);

	const metrics = useMemo(() => {
		const generics = medications.filter((med) => med.isGeneric).length;
		const tracker = medications.filter((med) => med.medicationTimes.length > 0).length;
		return [
			{ id: "active", label: "Active meds", value: medications.length, meta: "tracked" },
			{ id: "timeline", label: "Scheduled", value: tracker, meta: "with reminders" },
			{ id: "generics", label: "Generic coverage", value: `${medications.length ? Math.round((generics / medications.length) * 100) : 0}%`, meta: "cost optimized" },
			{ id: "alerts", label: "Refill alerts", value: lowStockMedications.length, meta: "below 10 doses" }
		];
	}, [medications, lowStockMedications.length]);

	const workspace = (
		<section className="medications-shell">
			<header className="medications-hero">
				<div>
					<p className="eyebrow">Regimen hub</p>
					<h1>Medication Workspace</h1>
					<p>Track active prescriptions, automate reminders, and keep refills on autopilot.</p>
				</div>
				<div className="hero-actions">
					<button
						className="primary-btn"
						onClick={() => {
							setIsComposerOpen(true);
							setSuccess("");
						}}
					>
						{editingId ? "Update medication" : "Add medication"}
					</button>
					<button className="ghost-btn" onClick={() => alert("Syncing prescriptions…")}>Sync e-prescriptions</button>
				</div>
			</header>

			<section className="medications-metrics">
				{metrics.map((metric) => (
					<article key={metric.id} className="medication-metric-card">
						<p className="metric-label">{metric.label}</p>
						<p className="metric-value">{metric.value}</p>
						<p className="metric-meta">{metric.meta}</p>
					</article>
				))}
			</section>

			<div className="medications-layout">
				<div className="medications-primary">
					{success && (
						<div className="toast success" role="status">{success}</div>
					)}

					<section className="medication-board">
						<div className="section-heading">
							<div>
								<p className="eyebrow">Active regimen</p>
								<h2>Your medications</h2>
							</div>
							<button className="ghost-btn" onClick={() => setIsComposerOpen(true)}>Compose new</button>
						</div>

						{medications.length === 0 ? (
							<div className="empty-state">
								<div className="empty-illustration" aria-hidden>💊</div>
								<h3>No medications tracked yet</h3>
								<p>Use the composer to add the medications prescribed by your clinician.</p>
								<button className="primary-btn" onClick={() => setIsComposerOpen(true)}>Add medication</button>
							</div>
						) : (
							<div className="medication-card-grid">
								{medications.map((medication) => (
									<article key={medication.id} className="medication-card">
										<header>
											<div>
												<h3>{medication.drugName}</h3>
												<p>{medication.strength} • {medication.dosageForm || "Form pending"}</p>
											</div>
											<span className={`chip ${medication.isGeneric ? "chip-success" : "chip-neutral"}`}>
												{medication.isGeneric ? "Generic" : "Brand"}
											</span>
										</header>
										<dl>
											<div>
												<dt>Dosage</dt>
												<dd>{medication.dosage || "—"}</dd>
											</div>
											<div>
												<dt>Frequency</dt>
												<dd>{medication.frequency || "—"}</dd>
											</div>
											<div>
												<dt>Schedule</dt>
												<dd>
													{(medication.medicationTimes || []).length > 0
														? medication.medicationTimes.join(", ")
														: "Add reminder"}
												</dd>
											</div>
											<div>
												<dt>Inventory</dt>
												<dd>{medication.inventory} doses</dd>
											</div>
										</dl>
										<footer>
											<button className="ghost-btn" onClick={() => handleEditMedication(medication)}>Edit</button>
											<button className="danger-btn" onClick={() => handleDeleteMedication(medication.id)}>Remove</button>
										</footer>
									</article>
								))}
							</div>
						)}
					</section>

					<section className="schedule-section">
						<div className="section-heading">
							<div>
								<p className="eyebrow">Upcoming doses</p>
								<h2>Today’s schedule</h2>
							</div>
							<span className="schedule-count">{scheduleBlocks.length} reminders</span>
						</div>
						{scheduleBlocks.length === 0 ? (
							<p className="muted">No scheduled doses yet.</p>
						) : (
							<ul className="schedule-list">
								{scheduleBlocks.map((block) => (
									<li key={block.id}>
										<div>
											<strong>{block.time}</strong>
											<p>{block.drugName}</p>
										</div>
										<div className="schedule-meta">
											<span>{block.dosage}</span>
											<span>{block.frequency}</span>
										</div>
									</li>
								))}
							</ul>
						)}
					</section>
				</div>

				<aside className="medications-secondary">
					<section className="composer-card">
						{isComposerOpen ? (
							<form onSubmit={handleSaveMedication}>
								<div className="section-heading">
									<div>
										<p className="eyebrow">Composer</p>
										<h3>{editingId ? "Update medication" : "Add medication"}</h3>
									</div>
									<button type="button" className="ghost-btn" onClick={resetComposer}>
										Close
									</button>
								</div>
								<label>
									Medication name
									<input
										type="text"
										name="drugName"
										value={newMedication.drugName}
										onChange={handleChange}
										required
									/>
									{errors.drugName && <span className="error-text">{errors.drugName}</span>}
								</label>
								<div className="field-grid">
									<label>
										Strength
										<input
											type="text"
											name="strength"
											value={newMedication.strength}
											onChange={handleChange}
										/>
									</label>
									<label>
										Dosage form
										<select name="dosageForm" value={newMedication.dosageForm} onChange={handleChange}>
											<option value="">Select</option>
											{dosageForms.map((form) => (
												<option key={form} value={form}>{form}</option>
											))}
										</select>
									</label>
								</div>
								<label>
									Dosage instructions
									<input
										type="text"
										name="dosage"
										value={newMedication.dosage}
										onChange={handleChange}
										required
									/>
									{errors.dosage && <span className="error-text">{errors.dosage}</span>}
								</label>
								<label>
									Frequency
									<select name="frequency" value={newMedication.frequency} onChange={handleChange} required>
										<option value="">Select</option>
										{frequencyOptions.map((option) => (
											<option key={option.value} value={option.value}>{option.label}</option>
										))}
									</select>
									{errors.frequency && <span className="error-text">{errors.frequency}</span>}
								</label>
								<div className="schedule-editor">
									<div className="schedule-editor__header">
										<p>Medication times</p>
										<button type="button" className="ghost-btn" onClick={addTime}>+ Add time</button>
									</div>
									{(newMedication.medicationTimes || []).length === 0 && (
										<p className="muted">No reminders yet.</p>
									)}
									{(newMedication.medicationTimes || []).map((time, index) => (
										<div key={index} className="time-row">
											<input
												type="time"
												value={time}
												onChange={(event) => updateTime(index, event.target.value)}
											/>
											<button type="button" className="danger-btn" onClick={() => removeTime(index)}>
												Remove
											</button>
										</div>
									))}
								</div>
								<div className="field-grid">
									<label>
										Start date
										<input type="date" name="startDate" value={newMedication.startDate} onChange={handleChange} required />
										{errors.startDate && <span className="error-text">{errors.startDate}</span>}
									</label>
									<label>
										End date
										<input type="date" name="endDate" value={newMedication.endDate} onChange={handleChange} />
										{errors.endDate && <span className="error-text">{errors.endDate}</span>}
									</label>
								</div>
								<div className="field-grid">
									<label>
										Refill reminder (days)
										<input
											type="number"
											name="refillReminder"
											min="0"
											value={newMedication.refillReminder}
											onChange={handleChange}
										/>
									</label>
									<label>
										On-hand doses
										<input
											type="number"
											name="inventory"
											min="0"
											value={newMedication.inventory}
											onChange={handleChange}
										/>
										{errors.inventory && <span className="error-text">{errors.inventory}</span>}
									</label>
								</div>
								<label className="checkbox-field">
									<input
										type="checkbox"
										name="isGeneric"
										checked={newMedication.isGeneric}
										onChange={handleChange}
									/>
									Use generic alternative
								</label>
								<div className="composer-actions">
									<button type="submit" className="primary-btn" disabled={loading}>
										{loading ? "Saving…" : editingId ? "Update medication" : "Add medication"}
									</button>
									<button type="button" className="ghost-btn" onClick={resetComposer}>
										Cancel
									</button>
								</div>
							</form>
						) : (
							<div className="composer-placeholder">
								<h3>Need to log a medication?</h3>
								<p>Open the composer to capture dosage, reminders, and refill alerts.</p>
								<button className="primary-btn" onClick={() => setIsComposerOpen(true)}>Launch composer</button>
							</div>
						)}
					</section>

					<section className="refill-alert-card">
						<div className="section-heading">
							<div>
								<p className="eyebrow">Refill radar</p>
								<h3>Low stock & renewals</h3>
							</div>
						</div>
						{lowStockMedications.length === 0 && upcomingRefills.length === 0 ? (
							<p className="muted">All set. No alerts right now.</p>
						) : (
							<ul className="alert-list">
								{lowStockMedications.map((med) => (
									<li key={`${med.id}-stock`}>
										<div>
											<strong>{med.drugName}</strong>
											<p>{med.inventory} doses remaining</p>
										</div>
										<span className="chip chip-warning">Order soon</span>
									</li>
								))}
								{upcomingRefills.map((med) => (
									<li key={`${med.id}-refill`}>
										<div>
											<strong>{med.drugName}</strong>
											<p>Ends {med.endDate}</p>
										</div>
										<span className="chip">Refill</span>
									</li>
								))}
							</ul>
						)}
					</section>

					<section className="tips-card">
						<h3>Care tips</h3>
						<ul>
							{guidanceTips.map((tip) => (
								<li key={tip.id}>
									<span className="tip-icon" aria-hidden>{tip.icon}</span>
									<div>
										<strong>{tip.title}</strong>
										<p>{tip.detail}</p>
									</div>
								</li>
							))}
						</ul>
					</section>
				</aside>
			</div>
		</section>
	);

	if (embedded) {
		return <div className="medications-embedded">{workspace}</div>;
	}

	return workspace;
};

export default Medications;

