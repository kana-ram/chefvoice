import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../pages/style.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Toggle open/close on button
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Always close menu when link is clicked
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="nav-bar">
      <div className="container">
        <div className="nav-content">
          <NavLink to="/home" className="logo" onClick={closeMenu}>
            ChefVoice
          </NavLink>

          {/* Hamburger button ALWAYS shown */}
          <button className="hamburger" onClick={toggleMenu}>
            ☰
          </button>

          <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <li>
              <NavLink to="/home" className="nav-link" onClick={closeMenu}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/search" className="nav-link" onClick={closeMenu}>
                Search
              </NavLink>
            </li>
            <li>
              <NavLink to="/favorites" className="nav-link" onClick={closeMenu}>
                Favorites
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className="nav-link" onClick={closeMenu}>
                Profile
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
