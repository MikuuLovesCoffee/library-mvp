// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <div>
        <Link to="/" className="mr-4">Home</Link>
        <Link to="/upload" className="mr-4">Upload</Link>
        {user && user.role === "admin" && (
          <Link to="/admin" className="mr-4">Admin Dashboard</Link>
        )}
      </div>
      <div>
        {user ? (
          <button onClick={logout} className="bg-red-600 px-3 py-1 rounded">Logout</button>
        ) : (
          <>
            <Link to="/login" className="mr-2">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
