import { useEffect, useState, useMemo } from "react";
import api from "../../services/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  // Sorting
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  // Create user modal / card state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    address: "",
    role: "USER",
    password: "",
  });

  // Notifications & Loading
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Auto-dismiss floating toasts
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("");
        setError("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/users");
      setUsers(response.data.users || response.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter and Sort in-memory (matches OwnerDashboard pattern)
  const processedUsers = useMemo(() => {
    const query = searchTerm.toLowerCase();

    const filtered = users.filter((u) => {
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const address = (u.address || "").toLowerCase();
      const role = (u.role || "").toUpperCase();

      const matchesSearch =
        name.includes(query) ||
        email.includes(query) ||
        address.includes(query);

      const matchesRole = selectedRole ? role === selectedRole : true;

      return matchesSearch && matchesRole;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key] || "";
        let valB = b[sortConfig.key] || "";

        const comparison = valA.toString().localeCompare(valB.toString());
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [users, searchTerm, selectedRole, sortConfig]);

  const handleSort = (column) => {
    setSortConfig((prev) => ({
      key: column,
      direction:
        prev.key === column && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortArrow = (column) => {
    if (sortConfig.key !== column) return " ↕";
    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  };

  const handleNewUserChange = (e) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const response = await api.post("/admin/users", newUser);
      setMessage(response.data?.message || "User created successfully!");

      setNewUser({
        name: "",
        email: "",
        address: "",
        role: "USER",
        password: "",
      });

      setShowCreateForm(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return "role-badge role-admin";
      case "OWNER":
        return "role-badge role-owner";
      default:
        return "role-badge role-user";
    }
  };

  return (
    <div className="page-container">
      {/* Floating Overlay Toast Notifications */}
      <div className="toast-container" aria-live="polite">
        {message && (
          <div className="toast-item toast-success">
            <span className="toast-icon">✓</span>
            <span className="toast-text">{message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => setMessage("")}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="toast-item toast-error">
            <span className="toast-icon">✕</span>
            <span className="toast-text">{error}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => setError("")}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Header Banner */}
      <div className="dashboard-hero">
        <span className="badge-pill">Admin Management</span>
        <h1>User Directory</h1>
        <p>
          Manage system access, view user details, and register new accounts.
        </p>
      </div>

      {/* ========================================== */}
      {/* TOOLBAR & SEARCH (OwnerDashboard Pattern)  */}
      {/* ========================================== */}
      <div className="search-box table-toolbar">
        <div className="toolbar-info">
          <h2>All Registered Users</h2>
          <span className="count-badge">
            {processedUsers.length}{" "}
            {processedUsers.length === 1 ? "User" : "Users"}
          </span>
        </div>

        <div className="toolbar-controls">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search by name, email, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="role-filter-select"
          >
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="OWNER">Owner</option>
            <option value="ADMIN">Admin</option>
          </select>

          {/* Prime Button Placement */}
          <button
            type="button"
            className="admin-primary-btn"
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setMessage("");
              setError("");
            }}
          >
            {showCreateForm ? "✕ Close" : "+ Add User"}
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* CREATE USER COLLAPSIBLE CARD FORM         */}
      {/* ========================================== */}
      {showCreateForm && (
        <div className="dashboard-card admin-form-card">
          <div className="form-card-header">
            <h3>Create New User</h3>
            <p>Fill in the account details to provision system access.</p>
          </div>

          <form onSubmit={handleCreateUser} className="admin-grid-form">
            <div className="form-grid">
              <div>
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  value={newUser.name}
                  onChange={handleNewUserChange}
                  required
                />
              </div>

              <div>
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={newUser.email}
                  onChange={handleNewUserChange}
                  required
                />
              </div>

              <div>
                <label>Assigned Role</label>
                <select
                  name="role"
                  value={newUser.role}
                  onChange={handleNewUserChange}
                  required
                >
                  <option value="USER">USER</option>
                  <option value="OWNER">STORE OWNER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div>
                <label>Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter password"
                    value={newUser.password}
                    onChange={handleNewUserChange}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="grid-full-width">
                <label>Address</label>
                <textarea
                  name="address"
                  rows="2"
                  placeholder="Enter physical street address"
                  value={newUser.address}
                  onChange={handleNewUserChange}
                  required
                />
              </div>
            </div>

            <div className="admin-form-actions">
              <button
                type="button"
                className="reset-btn"
                onClick={() => setShowCreateForm(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn-inline"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Save User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================== */}
      {/* USERS TABLE                                */}
      {/* ========================================== */}
      {loading ? (
        <div className="loading">Loading user directory...</div>
      ) : processedUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No users found</h3>
          <p>
            {searchTerm || selectedRole
              ? "No users match your active search and filter criteria."
              : "No users exist in the system yet."}
          </p>
          {(searchTerm || selectedRole) && (
            <button
              type="button"
              className="reset-btn"
              onClick={() => {
                setSearchTerm("");
                setSelectedRole("");
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th
                  onClick={() => handleSort("name")}
                  className="sortable-header"
                  title="Sort by Name"
                >
                  Name {getSortArrow("name")}
                </th>

                <th
                  onClick={() => handleSort("email")}
                  className="sortable-header"
                  title="Sort by Email"
                >
                  Email {getSortArrow("email")}
                </th>

                <th
                  onClick={() => handleSort("address")}
                  className="sortable-header"
                  title="Sort by Address"
                >
                  Address {getSortArrow("address")}
                </th>

                <th
                  onClick={() => handleSort("role")}
                  className="sortable-header"
                  title="Sort by Role"
                >
                  Role {getSortArrow("role")}
                </th>
              </tr>
            </thead>

            <tbody>
              {processedUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="store-cell-name">
                      <span className="store-avatar-mini">
                        {(u.name || "U").charAt(0).toUpperCase()}
                      </span>
                      <strong>{u.name}</strong>
                    </div>
                  </td>

                  <td>{u.email}</td>
                  <td className="store-cell-address">{u.address || "—"}</td>
                  <td>
                    <span className={getRoleBadgeClass(u.role)}>{u.role}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
