import { useEffect, useState } from "react";

import api from "../../services/api";

function OwnerRatings() {
  const [ratings, setRatings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const response = await api.get("/owner/ratings");

      setRatings(response.data.ratings || response.data);
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.message || "Failed to load ratings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Store Ratings</h1>

      {loading && <p>Loading...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && ratings.length === 0 && (
        <p>No ratings submitted yet.</p>
      )}

      {ratings.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Rating</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {ratings.map((rating) => (
              <tr key={rating.id}>
                <td>{rating.user_name}</td>

                <td>{rating.user_email}</td>

                <td>{rating.rating}</td>

                <td>
                  {rating.created_at
                    ? new Date(rating.created_at).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default OwnerRatings;
