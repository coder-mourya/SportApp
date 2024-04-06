import React from "react";
import { Link } from "react-router-dom";
import logo from "./PNG-logo-3.png";
import "../assets/Styles/Navbar.css"; 

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top d-lg-block">
      <div className="container">
        <a className="navbar-brand logo-font" href="/">
          <img src={logo} alt="Your Logo" width="70" className="d-inline-block align-top" />
          Sportsnerve
        </a>
        
        <button className="navbar-toggler d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse d-lg-block">
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
              <Link to={'Chart'} className="nav-link">Size chart</Link>
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

      <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasRight" aria-labelledby="offcanvasRightLabel">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasRightLabel">Offcanvas right</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link to={'About'} className="nav-link" onClick={() => document.getElementById("offcanvasRight").classList.remove('show')}>About us</Link>
            </li>
            <li className="nav-item">
              <Link to={'Features'} className="nav-link" onClick={() => document.getElementById("offcanvasRight").classList.remove('show')}>App Features</Link>
            </li>
            <li className="nav-item">
              <Link to={'FAQ'} className="nav-link" onClick={() => document.getElementById("offcanvasRight").classList.remove('show')}>FAQ's</Link>
            </li>
            <li className="nav-item">
              <Link to={'Chart'} className="nav-link" onClick={() => document.getElementById("offcanvasRight").classList.remove('show')}>Size chart</Link>
            </li>
            <li className="nav-item">
              <Link to={'Contact-us'} className="nav-link" onClick={() => document.getElementById("offcanvasRight").classList.remove('show')}>Contact us</Link>
            </li>
            <li className="nav-item">
              <button className="btn btn-danger login" onClick={() => document.getElementById("offcanvasRight").classList.remove('show')}>Login</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar;
