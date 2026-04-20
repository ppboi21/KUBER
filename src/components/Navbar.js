import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./Navbar.css";

const Navbar = () => {
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav className="navbar">

        <button className="brand-logo-btn" onClick={() => navigate("/dashboard")} aria-label="Go to Dashboard">
          <img src="/kubera-logo.png" alt="KUBE₹" className="brand-logo" />
        </button>

        <span className="brand-name">K U B E ₹</span>

        {currentUser && (
          <button
            className="menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <span /><span /><span />
          </button>
        )}
      </nav>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
};

export default Navbar;
