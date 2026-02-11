// Hospital and Doctor data models
export const hospitals = [
  // Example hospital
  {
    id: 1,
    name: "City Hospital",
    address: "123 Main St, Metropolis",
    contact: "123-456-7890",
    doctors: [1, 2], // doctor IDs
  },
];

export const doctors = [
  // Example doctor
  {
    id: 1,
    name: "Dr. Alice Smith",
    specialty: "Cardiology",
    hospitalId: 1,
    contact: "alice.smith@hospital.com",
  },
  {
    id: 2,
    name: "Dr. Bob Jones",
    specialty: "Neurology",
    hospitalId: 1,
    contact: "bob.jones@hospital.com",
  },
];
