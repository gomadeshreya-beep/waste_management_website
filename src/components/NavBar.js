import React from "react";
import { Link } from "react-router-dom";

function NavBar() {
  return (
    <nav className="navbar">
      <h1 className="logo">CleanNeighbour</h1>
      <div className="nav-links">
        <Link to="/login" className="btn">Login</Link>
        <Link to="/register" className="btn">Register</Link>
      </div>
    </nav>
  );
}

export default NavBar;
