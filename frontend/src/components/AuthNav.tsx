import { Link, useLocation } from "react-router-dom";
import "../styles/Components.css";

export default function AuthNav() {
  const location = useLocation();
  return (
    <nav className="absolute top-0 right-0 p-8 z-20 flex gap-4">
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
