import { useEffect, useState } from "react";

import api from "../../services/api";

function AdminStores() {
  const [stores, setStores] = useState([]);

  const [filters, setFilters] = useState({
    name: "",
    email: "",
    address: "",
  });

  const [sortBy, setSortBy] = useState("name");

  const [order, setOrder] = useState("ASC");

  const fetchStores = async () => {
    try {
      const response = await api.get("/admin/stores", {
        params: {
          ...filters,
          sortBy,
          order,
        },
      });

      setStores(response.data.stores);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [sortBy, order]);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();

    fetchStores();
  };

  return (
    <div>
      <h1>Stores</h1>

      <form onSubmit={handleSearch}>
        <input
          name="name"
          placeholder="Store Name"
          value={filters.name}
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Store Email"
          value={filters.email}
          onChange={handleChange}
        />

        <input
          name="address"
          placeholder="Address"
          value={filters.address}
          onChange={handleChange}
        />

        <button type="submit">Search</button>
      </form>

      <br />

      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="name">Name</option>

        <option value="email">Email</option>

        <option value="address">Address</option>

        <option value="rating">Rating</option>
      </select>

      <button onClick={() => setOrder(order === "ASC" ? "DESC" : "ASC")}>
        {order === "ASC" ? "Ascending ↑" : "Descending ↓"}
      </button>

      <br />
      <br />

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Address</th>
            <th>Average Rating</th>
          </tr>
        </thead>

        <tbody>
          {stores.map((store) => (
            <tr key={store.id}>
              <td>{store.name}</td>

              <td>{store.email}</td>

              <td>{store.address}</td>

              <td>{Number(store.average_rating).toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminStores;
