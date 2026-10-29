import { useState } from 'react';

import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/navbar.css';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const isAdmin = !!localStorage.getItem('adminToken');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  const NavLinks = ({ onClickLink }) => (
    <>
      <NavLink
        to="/"
        end
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        onClick={onClickLink}
      >
        Events
      </NavLink>

      <div className="nav-divider" aria-hidden="true" />

      {isAdmin ? (
        <>
          <span className="nav-admin-badge">Admin</span>
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClickLink}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/events"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClickLink}
          >
            Manage Events
          </NavLink>
          <NavLink
            to="/admin/registrations"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClickLink}
          >
            Registrations
          </NavLink>
          <button className="nav-logout" onClick={handleLogout} aria-label="Logout">
            Sign Out
          </button>
        </>
      ) : (
        <NavLink
          to="/admin/login"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onClickLink}
        >
          Admin Login
        </NavLink>
      )}
    </>
  );

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <NavLink to="/" className="navbar-brand" onClick={closeMobile}>
          <div className="navbar-brand-icon" aria-hidden="true">S</div>
          <div>
            <span className="navbar-brand-name">Sangam</span>
            <span className="navbar-brand-sub">College Events</span>
          </div>
        </NavLink>

        {/* Desktop nav */}
        <nav aria-label="Main navigation">
          <ul className="navbar-nav">
            <NavLinks onClickLink={closeMobile} />
          </ul>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="navbar-toggle"
          onClick={() => setMobileOpen(o => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile drawer */}
      <nav className={`navbar-mobile-menu ${mobileOpen ? 'open' : ''}`} aria-label="Mobile navigation">
        <NavLinks onClickLink={closeMobile} />
      </nav>
    </header>
  );
}
