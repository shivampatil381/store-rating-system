import { useEffect, useState, useMemo } from "react";
import api from "../../services/api";

function UserStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  // Modal State
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  // Floating Notification Toast States
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // "success" | "error"

  // Auto-dismiss Toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await api.get("/user/stores");
      setStores(response.data.stores || response.data || []);
    } catch (error) {
      console.error("Failed to load stores:", error);
      showToast(
        error.response?.data?.message || "Failed to fetch stores",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
  };

  // Helper to extract user rating
  const getUserRating = (store) => {
    return store.user_rating ?? store.my_rating ?? store.userRating ?? null;
  };

  // Handle header sorting click
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // In-memory Filter & Sort
  const processedStores = useMemo(() => {
    const query = searchTerm.toLowerCase();
    const filtered = stores.filter((store) => {
      const matchName = store.name?.toLowerCase().includes(query);
      const matchAddress = store.address?.toLowerCase().includes(query);
      return matchName || matchAddress;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let valA =
          sortConfig.key === "user_rating"
            ? getUserRating(a)
            : a[sortConfig.key];
        let valB =
          sortConfig.key === "user_rating"
            ? getUserRating(b)
            : b[sortConfig.key];

        if (valA === null || valA === undefined) valA = -1;
        if (valB === null || valB === undefined) valB = -1;

        if (typeof valA === "string") {
          const comparison = valA.localeCompare(valB.toString());
          return sortConfig.direction === "asc" ? comparison : -comparison;
        } else {
          return sortConfig.direction === "asc" ? valA - valB : valB - valA;
        }
      });
    }

    return filtered;
  }, [stores, searchTerm, sortConfig]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return " ↕";
    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  };

  // Modal Open Handler
  const handleOpenRatingModal = (store) => {
    const currentRating = getUserRating(store);
    setSelectedStore(store);
    setRatingValue(currentRating ? Number(currentRating) : 5);
    setHoverRating(0);
  };

  // Modal Close Handler
  const handleCloseModal = () => {
    if (submittingRating) return;
    setSelectedStore(null);
  };

  // Rating Submit Handler
  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!selectedStore) return;

    setSubmittingRating(true);

    try {
      // POST or PUT depending on your backend endpoint design
      await api.post(`/user/rating`, {
        store_id: selectedStore.id,
        rating: Number(ratingValue),
      });

      showToast(`Rating submitted for ${selectedStore.name}!`, "success");
      handleCloseModal();
      fetchStores(); // Refresh stores list with new average and user rating
    } catch (error) {
      console.error("Failed to submit rating:", error);
      showToast(
        error.response?.data?.message ||
          "Failed to submit rating. Please try again.",
        "error",
      );
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="page-container">
      {/* Floating Overlay Toast Messages */}
      <div className="toast-container" aria-live="polite">
        {toastMessage && (
          <div className={`toast-item toast-${toastType}`}>
            <span className="toast-icon">
              {toastType === "success" ? "✓" : "✕"}
            </span>
            <span className="toast-text">{toastMessage}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => setToastMessage("")}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Header Hero Banner */}
      <div className="dashboard-hero">
        <span className="badge-pill">Store Directory</span>
        <h1>Stores & Ratings</h1>
        <p>
          Explore stores, compare ratings, and submit your personal feedback.
        </p>
      </div>

      {/* Toolbar / Search Box */}
      <div className="search-box table-toolbar">
        <div className="toolbar-info">
          <h2>All Stores</h2>
          <span className="count-badge">
            {processedStores.length}{" "}
            {processedStores.length === 1 ? "Store" : "Stores"}
          </span>
        </div>

        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search by store name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Main Table / State View */}
      {loading ? (
        <div className="loading">Loading store directory...</div>
      ) : processedStores.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏪</div>
          <h3>No stores found</h3>
          <p>
            {searchTerm
              ? `No results match "${searchTerm}".`
              : "There are currently no stores available."}
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
                  className="sortable-header"
                  onClick={() => handleSort("name")}
                  title="Click to sort by Store Name"
                >
                  Store Name {getSortIcon("name")}
                </th>

                <th
                  className="sortable-header"
                  onClick={() => handleSort("address")}
                  title="Click to sort by Address"
                >
                  Address {getSortIcon("address")}
                </th>

                <th
                  className="sortable-header"
                  onClick={() => handleSort("average_rating")}
                  title="Click to sort by Overall Rating"
                >
                  Overall Rating {getSortIcon("average_rating")}
                </th>

                <th
                  className="sortable-header"
                  onClick={() => handleSort("user_rating")}
                  title="Click to sort by Your Rating"
                >
                  Your Rating {getSortIcon("user_rating")}
                </th>

                <th style={{ textAlign: "center" }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {processedStores.map((store) => {
                const hasAvgRating =
                  store.average_rating !== undefined &&
                  store.average_rating !== null;
                const avgRatingValue = hasAvgRating
                  ? Number(store.average_rating).toFixed(1)
                  : null;

                const userRatingRaw = getUserRating(store);
                const hasUserRating =
                  userRatingRaw !== null &&
                  userRatingRaw !== undefined &&
                  userRatingRaw !== "";
                const userRatingValue = hasUserRating
                  ? Number(userRatingRaw).toFixed(1)
                  : null;

                return (
                  <tr key={store.id}>
                    <td>
                      <div className="store-cell-name">
                        <span className="store-avatar-mini">
                          {store.name
                            ? store.name.charAt(0).toUpperCase()
                            : "S"}
                        </span>
                        <strong>{store.name}</strong>
                      </div>
                    </td>

                    <td className="store-cell-address">{store.address}</td>

                    {/* Overall Rating */}
                    <td>
                      {hasAvgRating ? (
                        <span className="rating-pill">
                          <span className="star-icon">★</span>
                          <span className="rating-num">{avgRatingValue}</span>
                          <span className="rating-max">/5</span>
                        </span>
                      ) : (
                        <span className="no-rating">Not Rated</span>
                      )}
                    </td>

                    {/* Your Rating */}
                    <td>
                      {hasUserRating ? (
                        <span className="rating-pill user-rating-pill">
                          <span className="star-icon user-star">★</span>
                          <span className="rating-num">{userRatingValue}</span>
                          <span className="rating-max">/5</span>
                        </span>
                      ) : (
                        <span className="no-rating-dash">—</span>
                      )}
                    </td>

                    {/* Modal Trigger Action */}
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        className={`table-action-btn ${
                          hasUserRating ? "table-action-edit" : ""
                        }`}
                        onClick={() => handleOpenRatingModal(store)}
                      >
                        {hasUserRating ? "Edit" : "Rate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* =========================================
          RATING MODAL POPUP
      ========================================= */}
      {selectedStore && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <div>
                <h2>Rate {selectedStore.name}</h2>
                <p className="modal-subtitle">
                  📍 {selectedStore.address || "No address provided"}
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseModal}
                disabled={submittingRating}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitRating} className="modal-form">
              <div className="star-picker-container">
                <label className="picker-label">Select Your Rating</label>

                {/* 5-Star Interactive Rating Picker */}
                <div className="star-picker">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className={`star-choice ${
                        (hoverRating || ratingValue) >= star ? "filled" : ""
                      }`}
                      onClick={() => setRatingValue(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <div className="star-score-indicator">
                  <strong>{hoverRating || ratingValue}</strong> out of 5 stars
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={handleCloseModal}
                  disabled={submittingRating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-submit-btn"
                  disabled={submittingRating}
                >
                  {submittingRating ? "Saving..." : "Submit Rating"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserStores;
