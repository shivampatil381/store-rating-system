import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/dashboard");
      setDashboard(response.data);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
      setError(err.response?.data?.message || "Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading admin dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Hero Banner with Integrated Metrics (Matches OwnerDashboard) */}
      <div className="dashboard-hero owner-hero-layout">
        <div className="hero-main-info">
          <span className="badge-pill">Admin Portal</span>
          <h1>System Overview</h1>
          <p className="hero-subtitle">
            Global system statistics, user accounts, and ratings distribution.
          </p>
        </div>

        {/* Hero Integrated Stat Cards */}
        <div className="hero-stats-group">
          <div className="hero-stat-card">
            <span className="hero-stat-label">Total Users</span>
            <div className="hero-stat-value">
              <span className="hero-sub-num">{dashboard?.totalUsers ?? 0}</span>
            </div>
          </div>

          <div className="hero-stat-card">
            <span className="hero-stat-label">Total Stores</span>
            <div className="hero-stat-value">
              <span className="hero-sub-num">
                {dashboard?.totalStores ?? 0}
              </span>
            </div>
          </div>

          <div className="hero-stat-card">
            <span className="hero-stat-label">Total Ratings</span>
            <div className="hero-stat-value">
              <span className="hero-sub-num">
                {dashboard?.totalRatings ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
