import React from "react";
import { Link } from "react-router-dom";
import logo from "./PNG-logo-3.png";
import "./Navbar.css"; 

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg">

      <div className="container">

        <a className="navbar-brand logo-font" href="/">
          <img src={logo} alt="Your Logo" width="70" className="d-inline-block align-top" />
          Sportsnerve
        </a>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto links-container">
            <li className="nav-item mx-3">
              <Link to={'About'} className="nav-link">About us</Link>
            </li>

            <li className="nav-item mx-3">
              <Link to={'Features'} className="nav-link">App Features</Link>
            </li>

            <li className="nav-item mx-3">
              <Link to={'FAQ'} className="nav-link">FAQ's</Link>
            </li>

            <li className="nav-item mx-3">
              <Link to={'Chart'} className="nav-link"> Size chart</Link>
            </li>

            <li className="nav-item mx-3">
              <Link to={'Contact-us'} className="nav-link">Contact us</Link>
            </li>

            <li className="nav-item mx-3 login-btn">
              <button className="btn btn-danger login">Login</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar;
