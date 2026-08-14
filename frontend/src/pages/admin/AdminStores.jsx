import { useEffect, useState, useMemo } from "react";
import api from "../../services/api";

function AdminStores() {
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Sorting
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  // Create store state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newStore, setNewStore] = useState({
    name: "",
    email: "",
    address: "",
    owner_id: "",
  });

  // Notifications & Loading
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Auto-dismiss floating toasts after 4 seconds
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("");
        setError("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  // ==========================================
  // FETCH STORES & OWNERS
  // ==========================================
  const fetchStores = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/stores");
      setStores(response.data.stores || response.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const response = await api.get("/admin/users", {
        params: { role: "OWNER" },
      });
      setOwners(response.data.users || response.data || []);
    } catch (err) {
      console.error("Failed to load owners:", err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // Filter and Sort in-memory
  const processedStores = useMemo(() => {
    const query = searchTerm.toLowerCase();

    const filtered = stores.filter((store) => {
      const name = (store.name || "").toLowerCase();
      const email = (store.email || "").toLowerCase();
      const address = (store.address || "").toLowerCase();

      return (
        name.includes(query) || email.includes(query) || address.includes(query)
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (valA === null || valA === undefined)
          valA = sortConfig.key === "average_rating" ? -1 : "";
        if (valB === null || valB === undefined)
          valB = sortConfig.key === "average_rating" ? -1 : "";

        if (sortConfig.key === "average_rating") {
          const numA = Number(valA) || 0;
          const numB = Number(valB) || 0;
          return sortConfig.direction === "asc" ? numA - numB : numB - numA;
        }

        const comp = valA.toString().localeCompare(valB.toString());
        return sortConfig.direction === "asc" ? comp : -comp;
      });
    }

    return filtered;
  }, [stores, searchTerm, sortConfig]);

  // ==========================================
  // HANDLERS
  // ==========================================
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

  const handleToggleCreateForm = () => {
    const nextState = !showCreateForm;
    setShowCreateForm(nextState);
    setMessage("");
    setError("");

    if (nextState && owners.length === 0) {
      fetchOwners();
    }
  };

  const handleNewStoreChange = (e) => {
    setNewStore({
      ...newStore,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const response = await api.post("/admin/stores", newStore);
      setMessage(response.data?.message || "Store created successfully!");

      setNewStore({
        name: "",
        email: "",
        address: "",
        owner_id: "",
      });

      setShowCreateForm(false);
      fetchStores();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create store");
    } finally {
      setSubmitting(false);
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
        <h1>Store Directory</h1>
        <p>
          Manage all registered stores, monitor overall performance, and assign
          store owners.
        </p>
      </div>

      {/* Toolbar & Search Bar */}
      <div className="search-box table-toolbar">
        <div className="toolbar-info">
          <h2>All Registered Stores</h2>
          <span className="count-badge">
            {processedStores.length}{" "}
            {processedStores.length === 1 ? "Store" : "Stores"}
          </span>
        </div>

        <div className="toolbar-controls">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search by store name, email, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <button
            type="button"
            className="admin-primary-btn"
            onClick={handleToggleCreateForm}
          >
            {showCreateForm ? "✕ Close" : "+ Add Store"}
          </button>
        </div>
      </div>

      {/* Create Store Collapsible Form Card */}
      {showCreateForm && (
        <div className="dashboard-card admin-form-card">
          <div className="form-card-header">
            <h3>Create New Store</h3>
            <p>Enter the store details and select an assigned store owner.</p>
          </div>

          <form onSubmit={handleCreateStore} className="admin-grid-form">
            <div className="form-grid">
              <div>
                <label>Store Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter store name"
                  value={newStore.name}
                  onChange={handleNewStoreChange}
                  required
                />
              </div>

              <div>
                <label>Store Contact Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="store@example.com"
                  value={newStore.email}
                  onChange={handleNewStoreChange}
                  required
                />
              </div>

              <div className="grid-full-width">
                <label>Store Owner</label>
                <select
                  name="owner_id"
                  value={newStore.owner_id}
                  onChange={handleNewStoreChange}
                  required
                >
                  <option value="">Select an Owner</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-full-width">
                <label>Store Address</label>
                <textarea
                  name="address"
                  rows="2"
                  placeholder="Enter street address, city, state, zip..."
                  value={newStore.address}
                  onChange={handleNewStoreChange}
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
                {submitting ? "Creating..." : "Save Store"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stores Table */}
      {loading ? (
        <div className="loading">Loading stores directory...</div>
      ) : processedStores.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏪</div>
          <h3>No stores found</h3>
          <p>
            {searchTerm
              ? `No stores match "${searchTerm}".`
              : "No stores have been registered in the system yet."}
          </p>
          {searchTerm && (
            <button
              type="button"
              className="reset-btn"
              onClick={() => setSearchTerm("")}
            >
              Clear Search
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
                  title="Sort by Store Name"
                >
                  Store Name {getSortArrow("name")}
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
                  onClick={() => handleSort("average_rating")}
                  className="sortable-header"
                  title="Sort by Rating"
                >
                  Average Rating {getSortArrow("average_rating")}
                </th>
              </tr>
            </thead>

            <tbody>
              {processedStores.map((store) => {
                const hasRating =
                  store.average_rating !== undefined &&
                  store.average_rating !== null;
                const ratingValue = hasRating
                  ? Number(store.average_rating).toFixed(1)
                  : null;

                return (
                  <tr key={store.id}>
                    <td>
                      <div className="store-cell-name">
                        <span className="store-avatar-mini">
                          {(store.name || "S").charAt(0).toUpperCase()}
                        </span>
                        <strong>{store.name}</strong>
                      </div>
                    </td>

                    <td>{store.email || "—"}</td>
                    <td className="store-cell-address">
                      {store.address || "—"}
                    </td>
                    <td>
                      {hasRating ? (
                        <span className="rating-pill">
                          <span className="star-icon">★</span>
                          <span className="rating-num">{ratingValue}</span>
                          <span className="rating-max">/5</span>
                        </span>
                      ) : (
                        <span className="no-rating">Not Rated</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminStores;
