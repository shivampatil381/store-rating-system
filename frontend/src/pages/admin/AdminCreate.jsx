import { useState } from "react";

import api from "../../services/api";

function AdminCreate() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "USER",
  });

  const [store, setStore] = useState({
    name: "",
    email: "",
    address: "",
  });

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const handleUserChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleStoreChange = (e) => {
    setStore({
      ...store,
      [e.target.name]: e.target.value,
    });
  };

  const createUser = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await api.post("/admin/users", user);

      setMessage(response.data.message || "User created successfully");

      setUser({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "USER",
      });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create user");
    }
  };

  const createStore = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await api.post("/admin/stores", store);

      setMessage(response.data.message || "Store created successfully");

      setStore({
        name: "",
        email: "",
        address: "",
      });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create store");
    }
  };

  return (
    <div>
      <h1>Admin Create</h1>

      {message && <p className="success-message">{message}</p>}

      {error && <p className="error-message">{error}</p>}

      <div>
        <h2>Create User</h2>

        <form onSubmit={createUser}>
          <input
            name="name"
            placeholder="Name"
            value={user.name}
            onChange={handleUserChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={user.email}
            onChange={handleUserChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={user.password}
            onChange={handleUserChange}
            required
          />

          <input
            name="address"
            placeholder="Address"
            value={user.address}
            onChange={handleUserChange}
            required
          />

          <select name="role" value={user.role} onChange={handleUserChange}>
            <option value="USER">USER</option>

            <option value="OWNER">OWNER</option>
          </select>

          <button type="submit">Create User</button>
        </form>
      </div>

      <hr />

      <div>
        <h2>Create Store</h2>

        <form onSubmit={createStore}>
          <input
            name="name"
            placeholder="Store Name"
            value={store.name}
            onChange={handleStoreChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Store Email"
            value={store.email}
            onChange={handleStoreChange}
            required
          />

          <input
            name="address"
            placeholder="Store Address"
            value={store.address}
            onChange={handleStoreChange}
            required
          />

          <button type="submit">Create Store</button>
        </form>
      </div>
    </div>
  );
}

export default AdminCreate;
