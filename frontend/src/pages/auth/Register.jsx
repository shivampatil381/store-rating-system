import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-dismiss floating notifications after 4 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (formData.name.trim().length < 20 || formData.name.trim().length > 60) {
      return "Name must be between 20 and 60 characters.";
    }

    if (formData.address.trim().length > 400) {
      return "Address cannot exceed 400 characters.";
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;
    if (!passwordRegex.test(formData.password)) {
      return "Password must be 8-16 characters with at least one uppercase letter and one special character.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", formData);

      setSuccess("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Floating Overlay Toast Messages */}
      <div className="toast-container" aria-live="polite">
        {success && (
          <div className="toast-item toast-success">
            <span className="toast-icon">✓</span>
            <span className="toast-text">{success}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => setSuccess("")}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="toast-item toast-error">
            <span className="toast-icon">✕</span>
            <span className="toast-text">{error}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => setError("")}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Main Registration Card */}
      <div className="auth-card register-card">
        <div className="auth-header">
          {/* <h2>Store Rating System</h2> */}
          <h3>Create an Account</h3>
          <p className="subtitle">Fill in the details below to get started.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div>
            <div className="label-row">
              <label htmlFor="name">Full Name</label>
              <span className="char-hint">{formData.name.length}/60</span>
            </div>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="e.g. Alexander Jonathan Montgomery"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password Field with Show/Hide toggle */}
          <div>
            <label htmlFor="password">Password</label>
            <div className="input-group">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="8-16 chars, 1 uppercase & 1 special"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Address Field */}
          <div>
            <div className="label-row">
              <label htmlFor="address">Address</label>
              <span className="char-hint">{formData.address.length}/400</span>
            </div>
            <textarea
              id="address"
              name="address"
              rows="3"
              placeholder="Enter your street address, city, state..."
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p>
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Register;
