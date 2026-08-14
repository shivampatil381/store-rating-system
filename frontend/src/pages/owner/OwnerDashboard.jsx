import { useEffect, useState, useMemo } from "react";
import api from "../../services/api";

function OwnerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Column sorting state
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      // Parallel requests for dashboard summary & ratings list
      const [dashboardResponse, ratingsResponse] = await Promise.all([
        api.get("/owner/dashboard"),
        api.get("/owner/ratings"),
      ]);

      setDashboard(
        dashboardResponse.data?.store || dashboardResponse.data || {},
      );
      setRatings(ratingsResponse.data?.ratings || ratingsResponse.data || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  // Header click sort handler
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Filter and Sort in-memory
  const processedRatings = useMemo(() => {
    const query = searchTerm.toLowerCase();
    const filtered = ratings.filter((r) => {
      const name = (r.user_name || r.name || "").toLowerCase();
      const email = (r.user_email || r.email || "").toLowerCase();
      return name.includes(query) || email.includes(query);
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (valA === null || valA === undefined) valA = "";
        if (valB === null || valB === undefined) valB = "";

        if (sortConfig.key === "rating") {
          return sortConfig.direction === "asc"
            ? Number(valA) - Number(valB)
            : Number(valB) - Number(valA);
        }

        if (sortConfig.key === "created_at") {
          const dateA = new Date(valA).getTime() || 0;
          const dateB = new Date(valB).getTime() || 0;
          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
        }

        const comp = valA.toString().localeCompare(valB.toString());
        return sortConfig.direction === "asc" ? comp : -comp;
      });
    }

    return filtered;
  }, [ratings, searchTerm, sortConfig]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return " ↕";
    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading store dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const avgRating = dashboard?.average_rating
    ? Number(dashboard.average_rating).toFixed(1)
    : "0.0";

  return (
    <div className="page-container">
      {/* Hero Banner with Integrated Metrics */}
      <div className="dashboard-hero owner-hero-layout">
        <div className="hero-main-info">
          <span className="badge-pill">Store Owner</span>
          <h1>{dashboard?.name || "My Store"}</h1>
          <p className="hero-subtitle">
            Real-time performance summary and customer feedback metrics.
          </p>
        </div>

        {/* Hero Stats Section */}
        <div className="hero-stats-group">
          <div className="hero-stat-card">
            <span className="hero-stat-label">Average Rating</span>
            <div className="hero-stat-value">
              <span className="hero-star">★</span>
              <span className="hero-rating-num">{avgRating}</span>
              <span className="hero-rating-max">/5</span>
            </div>
          </div>

          <div className="hero-stat-card">
            <span className="hero-stat-label">Total Submissions</span>
            <div className="hero-stat-value">
              <span className="hero-sub-num">
                {dashboard?.total_ratings ?? ratings.length ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Ratings Toolbar */}
      <div className="search-box table-toolbar">
        <div className="toolbar-info">
          <h2>Customer Ratings</h2>
          <span className="count-badge">
            {processedRatings.length}{" "}
            {processedRatings.length === 1 ? "Review" : "Reviews"}
          </span>
        </div>

        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search by customer name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Ratings Table / Empty State */}
      {processedRatings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>No customer reviews found</h3>
          <p>
            {searchTerm
              ? `No ratings match "${searchTerm}".`
              : "Customers have not submitted ratings for your store yet."}
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
                  onClick={() => handleSort("user_name")}
                  title="Click to sort by User"
                >
                  Customer {getSortIcon("user_name")}
                </th>

                <th
                  className="sortable-header"
                  onClick={() => handleSort("user_email")}
                  title="Click to sort by Email"
                >
                  Email Address {getSortIcon("user_email")}
                </th>

                <th
                  className="sortable-header"
                  onClick={() => handleSort("rating")}
                  title="Click to sort by Rating"
                >
                  Rating {getSortIcon("rating")}
                </th>

                <th
                  className="sortable-header"
                  onClick={() => handleSort("created_at")}
                  title="Click to sort by Date"
                >
                  Date Submitted {getSortIcon("created_at")}
                </th>
              </tr>
            </thead>

            <tbody>
              {processedRatings.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td>
                    <div className="store-cell-name">
                      <span className="store-avatar-mini">
                        {(item.user_name || item.name || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                      <strong>
                        {item.user_name || item.name || "Anonymous"}
                      </strong>
                    </div>
                  </td>

                  <td className="store-cell-address">
                    {item.user_email || item.email || "—"}
                  </td>

                  <td>
                    <span className="rating-pill">
                      <span className="star-icon">★</span>
                      <span className="rating-num">{item.rating}</span>
                      <span className="rating-max">/5</span>
                    </span>
                  </td>

                  <td className="date-cell">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )
                      : "—"}
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

export default OwnerDashboard;
