import { useEffect, useState } from "react";

import api from "../../services/api";

function UserStores() {
  const [stores, setStores] = useState([]);

  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] = useState("name");

  const [order, setOrder] = useState("ASC");

  const [loading, setLoading] = useState(true);

  const fetchStores = async () => {
    setLoading(true);

    try {
      const response = await api.get("/user/stores", {
        params: {
          search,
          sortBy,
          order,
        },
      });

      setStores(response.data.stores || response.data);
    } catch (error) {
      console.error("Failed to load stores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [sortBy, order]);

  const handleSearch = (e) => {
    e.preventDefault();

    fetchStores();
  };

  return (
    <div>
      <h1>Stores</h1>

      {/* Search */}

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by store name or address"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button type="submit">Search</button>
      </form>

      <br />

      {/* Sorting */}

      <label>Sort By:</label>

      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="name">Name</option>

        <option value="rating">Rating</option>
      </select>

      <button onClick={() => setOrder(order === "ASC" ? "DESC" : "ASC")}>
        {order === "ASC" ? "Ascending ↑" : "Descending ↓"}
      </button>

      <hr />

      {loading ? (
        <p>Loading...</p>
      ) : stores.length === 0 ? (
        <p>No stores found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Store Name</th>
              <th>Address</th>
              <th>Overall Rating</th>
              <th>Your Rating</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {stores.map((store) => (
              <tr key={store.id}>
                <td>{store.name}</td>

                <td>{store.address}</td>

                <td>{store.average_rating ?? "No ratings"}</td>

                <td>{store.user_rating ?? "Not Rated"}</td>

                <td>
                  <button
                    onClick={() =>
                      (window.location.href = `/user/rate/${store.id}`)
                    }
                  >
                    {store.user_rating ? "Update Rating" : "Rate Store"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UserStores;
