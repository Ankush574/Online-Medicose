import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import Button from "./components/Button";
import "./Login.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const Login = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "User",
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    setErrors({ ...errors, [name]: "" });
    setSuccess("");
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setErrors({});
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const message = data?.message || "Login failed. Please check your credentials.";
        throw new Error(message);
      }

      const apiUser = data?.user || {};
      const apiRole = apiUser.role || formData.role || "User";
      const normalizedRole = (apiRole || "User").trim() || "User";
      const roleDisplay = normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1).toLowerCase();

      const userData = {
        id: apiUser.id || Date.now().toString(),
        name: apiUser.name || formData.name || formData.email.split("@")[0],
        email: apiUser.email || formData.email,
        role: roleDisplay,
        rememberMe: formData.rememberMe,
        token: data?.token,
      };

      login(userData);
      setSuccess("Login successful! Welcome back.");

      const roleRedirectMap = {
        Doctor: "/doctor-dashboard",
        Pharmacist: "/pharmacist-dashboard",
        Admin: "/admin-dashboard",
      };

      navigate(roleRedirectMap[roleDisplay] || "/dashboard");
    } catch (error) {
      setErrors({ general: error.message || "Login failed. Please check your credentials." });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.email && formData.password;

  return (
    <div className="login-container">
      <div className="brand-header">
        <h1 className="brand-title">MediCose</h1>
        <p className="brand-subtitle">Your Healthcare Companion</p>
      </div>
      <form className="login-box" onSubmit={handleSubmit}>
        <h2>Welcome back</h2>
        <p className="auth-subtitle">Sign in to track your medications, prescriptions, and orders in one place.</p>

        {success && <div className="success-message">{success}</div>}
        {errors.general && <div className="error-message">{errors.general}</div>}

        <div>
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Full Name (optional)"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? "error-input" : ""}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div>
          <label htmlFor="role">Login as</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={errors.role ? "error-input" : ""}
          >
            <option value="User">User</option>
            <option value="Pharmacist">Pharmacist</option>
            <option value="Doctor">Doctor</option>
            <option value="Admin">Admin</option>
          </select>
          {errors.role && <span className="error">{errors.role}</span>}
        </div>

        <div className="password-container">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? "error-input" : ""}
          />
          <span
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        <div className="checkbox-container">
          <input
            id="rememberMe"
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
          />
          <label htmlFor="rememberMe">
            Remember me
          </label>
        </div>

        <Button
          type="submit"
          disabled={!isFormValid || loading}
          loading={loading}
          className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700"
        >
          Login
        </Button>

        <p className="login-text">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;