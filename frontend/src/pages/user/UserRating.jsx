import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";

function UserRating() {
  const { storeId } = useParams();

  const navigate = useNavigate();

  const [store, setStore] = useState(null);

  const [rating, setRating] = useState("");

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStore();
  }, [storeId]);

  const fetchStore = async () => {
    try {
      const response = await api.get(`/user/stores/${storeId}`);

      const data = response.data.store || response.data;

      setStore(data);

      if (data.user_rating) {
        setRating(data.user_rating);
      }
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.message || "Failed to load store");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (rating < 1 || rating > 5) {
      setError("Rating must be between 1 and 5");

      return;
    }

    try {
      await api.post(`/user/stores/${storeId}/rating`, {
        rating: Number(rating),
      });

      setMessage("Rating submitted successfully.");

      setTimeout(() => {
        navigate("/user/stores");
      }, 1000);
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.message || "Failed to submit rating");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!store) {
    return <p>Store not found.</p>;
  }

  return (
    <div>
      <h1>{store.name}</h1>

      <p>{store.address}</p>

      <p>Overall Rating: {store.average_rating ?? "No ratings"}</p>

      {error && <p className="error-message">{error}</p>}

      {message && <p className="success-message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <label>Your Rating</label>

        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          required
        >
          <option value="">Select Rating</option>

          <option value="1">1 - Poor</option>

          <option value="2">2 - Fair</option>

          <option value="3">3 - Good</option>

          <option value="4">4 - Very Good</option>

          <option value="5">5 - Excellent</option>
        </select>

        <button type="submit">
          {store.user_rating ? "Update Rating" : "Submit Rating"}
        </button>
      </form>

      <br />

      <button onClick={() => navigate("/user/stores")}>Back to Stores</button>
    </div>
  );
}

export default UserRating;
