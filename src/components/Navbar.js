import React, { useState } from "react";
import { Link} from "react-router-dom";
import logo from "../assets/img/logo.png";
import "../assets/Styles/Navbar.css";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";


const Navbar = () => {

  const [show, setShow] = useState(false);
  
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  
  const {t} = useTranslation('home');



  const Navigate = useNavigate()

  const handleLogin = () => {

    // Navigate("/login");
    // handleClose()

    Navigate("/ComingSoon")
 
  }
  

 


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
            {/* <li className="nav-item mx-3">
              <Link to={'About'} className="nav-link">About us</Link>
            </li> */}
            <li className="nav-item mx-3">
              <Link to={'Features'} className="nav-link">{t('nav.link1')}</Link>
            </li>
            <li className="nav-item mx-3">
              <Link to={'FAQPage'} className="nav-link">{t('nav.link2')}</Link>
            </li>
            <li className="nav-item mx-3">
              <Link to={'Chart'} className="nav-link">{t('nav.link3')}</Link>
            </li>
            <li className="nav-item mx-3">
              <Link to={'ContactPage'} className="nav-link">{t('nav.link4')}</Link>
            </li>


             
          <li className="nav-item mx-3 login-btn">
            <button className="btn btn-danger login" onClick={handleLogin}>{t('nav.link5')}</button>
           
          </li>
       

          </ul>
        </div>



      </div>
      {/* navbar  offcanvas for small device  */}

      <Offcanvas show={show} onHide={handleClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title> Sportsnerve </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ul className="navbar-nav ms-auto links-container">
            {/* <li className="nav-item mx-3">
              <Link to={'About'} className="nav-link" onClick={handleClose}>About us</Link>
            </li> */}
            <li className="nav-item mx-3">
              <Link to={'Features'} className="nav-link" onClick={handleClose}>App Features</Link>
            </li>
            <li className="nav-item mx-3">
              <Link to={'FAQPage'} className="nav-link" onClick={handleClose}>FAQ's</Link>
            </li>
            <li className="nav-item mx-3">
              <Link to={'Chart'} className="nav-link" onClick={handleClose}>Size chart</Link>
            </li>
            <li className="nav-item mx-3">
              <Link to={'ContactPage'} className="nav-link" onClick={handleClose}>Contact us</Link>
            </li>
            <li className="nav-item mx-3 login-btn">
              <button className="btn btn-danger login" onClick={handleLogin} >Login</button>
              
               
            </li>
          </ul>
        </Offcanvas.Body>
      </Offcanvas>

    </nav>
  )
}

export default Navbar;
