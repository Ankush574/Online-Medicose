import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import { AuthContext } from "./AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState([
    { id: 1, name: "Paracetamol", strength: "500mg", price: 5.99, quantity: 2 },
    { id: 2, name: "Ibuprofen", strength: "200mg", price: 7.49, quantity: 1 },
  ]);

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item => item.id === id ? { ...item, quantity } : item));
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      return;
    }

    try {
      const headers = {
        "Content-Type": "application/json",
      };
      if (user?.token) {
        headers.Authorization = `Bearer ${user.token}`;
      }
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId: user?.id,
          userEmail: user?.email,
          items: cart.map((item) => ({
            medicine: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          totalAmount: total,
        }),
      });

      if (!response.ok) {
        // For now, just log; UI still navigates to orders page
        console.error("Failed to create order", await response.text());
      }
    } catch (err) {
      console.error("Checkout error", err);
    }

    setCart([]);
    navigate("/dashboard/orders");
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <TopNavbar />

      <main className="dashboard-main">
        <div className="max-w-4xl mx-auto font-sans">
          <header className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
          </header>

          {cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Your cart is empty</p>
              <Link to="/shop" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-gray-600">{item.strength}</p>
                      <p className="text-lg font-bold text-indigo-600">${item.price}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 border border-gray-300 rounded">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => updateQuantity(item.id, 0)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Total: ${total.toFixed(2)}</h2>
                </div>
                <div className="flex space-x-4">
                  <Link to="/shop" className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600">
                    Continue Shopping
                  </Link>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Cart;