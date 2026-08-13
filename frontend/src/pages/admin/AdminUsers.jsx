import { useEffect, useState } from "react";

import api from "../../services/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);

  const [filters, setFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
  });

  const [sortBy, setSortBy] = useState("name");

  const [order, setOrder] = useState("ASC");

  const fetchUsers = async () => {
    try {
      const params = {
        ...filters,
        sortBy,
        order,
      };

      const response = await api.get("/admin/users", { params });

      setUsers(response.data.users);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [sortBy, order]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();

    fetchUsers();
  };

  return (
    <div>
      <h1>Users</h1>

      <form onSubmit={handleSearch}>
        <input
          name="name"
          placeholder="Name"
          value={filters.name}
          onChange={handleFilterChange}
        />

        <input
          name="email"
          placeholder="Email"
          value={filters.email}
          onChange={handleFilterChange}
        />

        <input
          name="address"
          placeholder="Address"
          value={filters.address}
          onChange={handleFilterChange}
        />

        <select name="role" value={filters.role} onChange={handleFilterChange}>
          <option value="">All Roles</option>

          <option value="USER">USER</option>

          <option value="OWNER">OWNER</option>

          <option value="ADMIN">ADMIN</option>
        </select>

        <button type="submit">Search</button>
      </form>

      <br />

      <div>
        <label>Sort By:</label>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Name</option>

          <option value="email">Email</option>

          <option value="address">Address</option>

          <option value="role">Role</option>
        </select>

        <button onClick={() => setOrder(order === "ASC" ? "DESC" : "ASC")}>
          {order === "ASC" ? "Ascending ↑" : "Descending ↓"}
        </button>
      </div>

      <br />

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Address</th>
            <th>Role</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>

              <td>{user.email}</td>

              <td>{user.address}</td>

              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsers;
