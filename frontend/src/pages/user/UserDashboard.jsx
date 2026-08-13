import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await api.get("/user/stores");

      setStores(response.data.stores || response.data);
    } catch (error) {
      console.error("Failed to load stores:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>User Dashboard</h1>

      <h2>Welcome, {user?.name}</h2>

      <hr />

      <h2>Available Stores</h2>

      {loading ? (
        <p>Loading stores...</p>
      ) : stores.length === 0 ? (
        <p>No stores available.</p>
      ) : (
        <div>
          {stores.slice(0, 5).map((store) => (
            <div key={store.id} className="dashboard-card">
              <h3>{store.name}</h3>

              <p>{store.address}</p>

              <p>Rating: {store.average_rating ?? "No ratings"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
