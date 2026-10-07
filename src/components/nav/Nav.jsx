import React from 'react'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import logo from '../../assets/Logo_main.png'
import './Nav.css'

const Nav = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-inner">
        <NavLink className="admin-logo" to="/forms" aria-label="Petal Haven admin home" onClick={() => setMenuOpen(false)}>
          <img src={logo} alt="Petal Haven" />
        </NavLink>

        <nav id="admin-navigation" className={`admin-nav-links${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          <NavLink to="/forms" onClick={() => setMenuOpen(false)} className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            Forms
          </NavLink>
          <NavLink to="/gallery" onClick={() => setMenuOpen(false)} className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            All Gallery
          </NavLink>
        </nav>

        <div className="admin-nav-actions">
          <button className="btn admin-logout-btn" type="button" onClick={() => {
            localStorage.removeItem('adminToken')
            navigate('/')
          }}>
            Logout
          </button>
          <button
            className={`admin-nav-toggle${menuOpen ? ' is-open' : ''}`}
            type="button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="admin-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Nav
