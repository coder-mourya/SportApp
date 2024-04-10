import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/img/logo.png";
import "../assets/Styles/Navbar.css";
import Offcanvas from "react-bootstrap/Offcanvas";
import LoginForm from "./AfterLogin/Login";

const Navbar = () => {

  const [show, setShow] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleShowLogin = () => setShowLogin(true)
  const handleCloseLogin = () => setShowLogin(false)


  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top d-lg-block">
      <div className="container">
        <a className="navbar-brand logo-font" href="/">
          <img src={logo} alt="Your Logo" width="55" className="d-inline-block align-top me-4" />
          Sportsnerve
        </a>

        <button className="navbar-toggler d-lg-none" type="button" onClick={handleShow}>
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

              <button className="btn btn-danger login" onClick={handleShowLogin}>Login</button>

            </li>
          </ul>
        </div>
        {/* Login offcanvas  */}
        <Offcanvas show={showLogin} onHide={handleCloseLogin} placement="end" backdrop="static">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title> <img src={logo} alt="logo" /> Sportsnerve</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <LoginForm />
          </Offcanvas.Body>
        </Offcanvas>


      </div>
      {/* navbar  offcanvas for small device  */}

      <Offcanvas show={show} onHide={handleClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title> Sportsnerve </Offcanvas.Title>

        </Offcanvas.Header>
        <Offcanvas.Body>
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

            <Link to={"/login"}>

            <button className="btn btn-danger login">Login</button>
            </Link>  
              

            </li>
          </ul>
        </Offcanvas.Body>
      </Offcanvas>
    </nav>
  )
}

export default Navbar;
