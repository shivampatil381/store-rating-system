import { useState, useEffect } from "react";
import api from "../../services/api";

function UserPassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Auto-dismiss floating toast notifications after 4 seconds
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("");
        setError("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  // Live password strength calculation
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength(newPassword);
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.put("/user/password", {
        currentPassword,
        newPassword,
      });

      setMessage(response.data?.message || "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Floating Overlay Toast Notifications */}
      <div className="toast-container" aria-live="polite">
        {message && (
          <div className="toast-item toast-success">
            <span className="toast-icon">✓</span>
            <span className="toast-text">{message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => setMessage("")}
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

      {/* Main Password Card */}
      <div className="password-wrapper">
        <div className="password-header">
          <h1>Change Password</h1>
          <p className="subtitle">
            Update your account password to keep your account secure.
          </p>
        </div>

        <form className="password-form" onSubmit={handleSubmit}>
          {/* Current Password */}
          <div className="form-field">
            <label htmlFor="currentPassword">Current Password</label>
            <div className="input-group">
              <input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowCurrent(!showCurrent)}
                tabIndex="-1"
              >
                {showCurrent ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="form-field">
            <label htmlFor="newPassword">New Password</label>
            <div className="input-group">
              <input
                id="newPassword"
                type={showNew ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowNew(!showNew)}
                tabIndex="-1"
              >
                {showNew ? "Hide" : "Show"}
              </button>
            </div>

            {/* Password Strength Meter */}
            {newPassword && (
              <div className="strength-meter">
                <div className="strength-bars">
                  {[1, 2, 3, 4].map((step) => (
                    <span
                      key={step}
                      className={`bar ${
                        step <= strengthScore
                          ? `active score-${strengthScore}`
                          : ""
                      }`}
                    />
                  ))}
                </div>
                <span className="strength-text">
                  Strength: {strengthLabels[strengthScore - 1] || "Weak"}
                </span>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="form-field">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserPassword;
