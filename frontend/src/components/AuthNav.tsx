import { Link, useLocation } from "react-router-dom";
import "../styles/Components.css";

export default function AuthNav() {
  const location = useLocation();
  return (
    <nav className="auth-nav">
      {location.pathname !== "/login" && (
        <Link to="/login" className="nav-btn nav-btn-outline">
          Sign in
        </Link>
      )}
      {location.pathname !== "/register" && (
        <Link to="/register" className="nav-btn nav-btn-solid">
          Sign up
        </Link>
      )}
    </nav>
  );
}
