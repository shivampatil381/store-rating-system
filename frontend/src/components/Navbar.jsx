import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div>
        <h2>Store Rating System</h2>
      </div>

      <div className="nav-links">
        {user?.role === "USER" && (
          <>
            <Link to="/user/dashboard">Dashboard</Link>

            <Link to="/user/stores">Stores</Link>

            <Link to="/user/password">Change Password</Link>
          </>
        )}

        {user?.role === "OWNER" && (
          <>
            <Link to="/owner/dashboard">Dashboard</Link>

            <Link to="/owner/ratings">Ratings</Link>

            <Link to="/owner/password">Change Password</Link>
          </>
        )}

        {user?.role === "ADMIN" && (
          <>
            <Link to="/admin/dashboard">Dashboard</Link>

            <Link to="/admin/users">Users</Link>

            <Link to="/admin/stores">Stores</Link>
          </>
        )}

        {user && <button onClick={handleLogout}>Logout</button>}
      </div>
    </nav>
  );
}

export default Navbar;
