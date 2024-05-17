import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/img/logo.png";
import "../assets/Styles/Navbar.css";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import date from "../assets/img/calendar.svg";
import time from "../assets/img/time.svg";
import notification from "../assets/img/notification.svg";
import { useSelector, useDispatch } from 'react-redux';
import { logout } from "../reducers/authSlice";
import profile from "../assets/afterLogin picks/home/profile.jpg"

const Navbar = () => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const { t } = useTranslation('home');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();

  const Navigate = useNavigate();

  const handleLogin = () => {
    Navigate("/login");
    handleClose();
  };

  const handleLogout = () => {
    dispatch(logout());
    Navigate("/");
  };

  const changePassword = () =>{
    Navigate("/ChangePass")
  }

  useEffect(() => {
    if (isLoggedIn) {
      console.log("user data coming", JSON.stringify(user?.data.user.profileImage));
    }
  }, [isLoggedIn, user]);


  useEffect(() =>{
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, [])

  
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
            {!isLoggedIn ? (
              <>
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
              </>
            ) : (
              <>
                <li className="nav-item mx-3 ">
                  <img src={date} alt="calender" className="mx-2" />
                  <span className="date-text">
                    {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </li>
                <li className="nav-item mx-3 ">
                  <img src={time} alt="time" className="mx-2" />
                  <span className="date-text">
                    {currentTime}
                  </span>
                </li>
                <li className=" nav-item mx-3">
                  <button className="btn"><img src={notification} alt="notification" /></button>
                </li>
                <li className="nav-item mx-3 user-dropdown">
                  <div className="dropdown">
                    <button className="btn dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                      <img src={profile ? profile : user.data.user.profileImage} alt="user" className="user-profile-pic" />
                      {user && user.data.user.fullName}
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="userDropdown">
                      <li><Link to={'/ViewProfile'} className="dropdown-item">View Profile</Link></li>
                      <li><button className="dropdown-item" onClick={changePassword}>Change Password</button></li>
                      <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>

                    </ul>
                  </div>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* navbar offcanvas for small device */}
      <Offcanvas show={show} onHide={handleClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title> Sportsnerve </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ul className="navbar-nav ms-auto links-container">
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
              <button className="btn btn-danger login" onClick={handleLogin}>Login</button>
            </li>
          </ul>
        </Offcanvas.Body>
      </Offcanvas>
    </nav>
  );
};

export default Navbar;
