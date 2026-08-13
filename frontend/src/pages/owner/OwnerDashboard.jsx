import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../../services/api";

function OwnerDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);

  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/owner/dashboard");

      setDashboard(response.data);
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.message || "Failed to load dashboard");
    }
  };

  if (error) {
    return <p>{error}</p>;
  }

  if (!dashboard) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Store Owner Dashboard</h1>

      <div>
        <div className="dashboard-card">
          <h3>Store</h3>

          <p>{dashboard.store?.name}</p>
        </div>

        <div className="dashboard-card">
          <h3>Average Rating</h3>

          <p>{dashboard.averageRating ?? "No ratings"}</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Ratings</h3>

          <p>{dashboard.totalRatings}</p>
        </div>
      </div>

      <br />

      <button onClick={() => navigate("/owner/ratings")}>View Ratings</button>

      <button onClick={() => navigate("/owner/password")}>
        Change Password
      </button>
    </div>
  );
}

export default OwnerDashboard;
