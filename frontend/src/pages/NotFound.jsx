import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="auth-container">
      <div className="auth-card not-found-card">
        <div className="not-found-badge">404 Error</div>

        <h1 className="not-found-code">404</h1>

        <h2>Page Not Found</h2>

        <p className="not-found-text">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>

        <Link to="/login" className="not-found-btn-link">
          <button type="button" className="submit-btn">
            Back to Safety
          </button>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
