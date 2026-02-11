import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

// Mock medicine data used as a fallback if the backend is unavailable
const mockMedicines = [
  { id: 1, name: "Paracetamol", strength: "500mg", form: "Tablet", price: 5.99, stock: 100 },
  { id: 2, name: "Ibuprofen", strength: "200mg", form: "Tablet", price: 7.49, stock: 50 },
  { id: 3, name: "Amoxicillin", strength: "250mg", form: "Capsule", price: 12.99, stock: 25 },
  { id: 4, name: "Aspirin", strength: "100mg", form: "Tablet", price: 4.99, stock: 75 },
  { id: 5, name: "Vitamin C", strength: "1000mg", form: "Tablet", price: 9.99, stock: 200 },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const Shop = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [medicines, setMedicines] = useState(mockMedicines);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/medicines`);
        if (!response.ok) {
          throw new Error("Failed to load medicines");
        }
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setMedicines(data);
        } else {
          // Keep fallback mock data if API returns empty
          setMedicines(mockMedicines);
        }
      } catch (err) {
        console.error("Error fetching medicines", err);
        setError("Unable to load medicines from the server. Showing sample data.");
        setMedicines(mockMedicines);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  const filteredMedicines = medicines.filter((med) =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (medicine) => {
    const existing = cart.find(item => item.id === medicine.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...medicine, quantity: 1 }]);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <TopNavbar />

      <main className="dashboard-main">
        <div className="max-w-6xl mx-auto font-sans">
          <header className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800">Medicine Shop</h1>
            <Link to="/cart" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
              Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            </Link>
          </header>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {loading && (
            <p className="text-gray-500 mb-4">Loading medicines...</p>
          )}
          {error && (
            <p className="text-red-500 mb-4">{error}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedicines.map(medicine => (
              <div key={medicine.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{medicine.name}</h3>
                <p className="text-gray-600 mb-1"><strong>Strength:</strong> {medicine.strength}</p>
                <p className="text-gray-600 mb-1"><strong>Form:</strong> {medicine.form}</p>
                <p className="text-gray-600 mb-1"><strong>Stock:</strong> {medicine.stock}</p>
                <p className="text-2xl font-bold text-indigo-600 mb-4">${medicine.price}</p>
                <button
                  onClick={() => addToCart(medicine)}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                  disabled={medicine.stock === 0}
                >
                  {medicine.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Shop;