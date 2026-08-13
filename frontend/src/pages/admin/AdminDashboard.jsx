import { useEffect, useState } from "react";

import api from "../../services/api";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);

  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/admin/dashboard");

      setDashboard(response.data);
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.message || "Failed to load dashboard");
    }
  };

  if (error) {
    return <h3>{error}</h3>;
  }

  if (!dashboard) {
    return <h3>Loading...</h3>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Total Users</h3>
          <p>{dashboard.totalUsers}</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Stores</h3>
          <p>{dashboard.totalStores}</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Ratings</h3>
          <p>{dashboard.totalRatings}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
