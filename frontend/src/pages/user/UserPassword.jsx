import { useState } from "react";

import api from "../../services/api";

function UserPassword() {
  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await api.put("/user/password", {
        currentPassword,
        newPassword,
      });

      setMessage(response.data.message || "Password updated successfully");

      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update password");
    }
  };

  return (
    <div>
      <h1>Change Password</h1>

      {message && <p className="success-message">{message}</p>}

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Current Password</label>

          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label>New Password</label>

          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Update Password</button>
      </form>
    </div>
  );
}

export default UserPassword;
