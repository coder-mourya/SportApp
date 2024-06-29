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
import profile from "../assets/afterLogin picks/home/profile.jpg";
import Login from "./login/Login";
import ForgotPassword from "./login/ForgotPass";
import Register from "./login/Register";
import PassRecovery from "./login/PassRecovery";
import VerifyMail from "./login/VerifyMail";





const Navbar = ({showLogin , setShowLogin}) => {
  const [show, setShow] = useState(false);
  const [showPassRecovery, setShowPassRecovery] = useState(false);
  const [showVerificationMail, setShowVerificationMail] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [vericationEmail, setVerficationEmail] = useState('')
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const { t } = useTranslation('home');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();

  
  const Navigate = useNavigate();


  // const [showLogin, setShowLogin] = useState(false);
  const [currentComponent, setCurrentComponent] = useState("login");
  const handleShowLogin = () => {
    setCurrentComponent("login");
    setShowLogin(true);

  };

  const handleCloseLogin = () => setShowLogin(false);
  const handleClosePassRecovery = () => setShowPassRecovery(false);


  const closeOffcanvas = () => {
    handleCloseLogin();
    handleClose();
    handleClosePassRecovery()
    handleCloseVerificationMail()

  }


  const handleComponentChange = (component) => {
    setCurrentComponent(component);
  };


  const handleShowPassRecovery = (email) => {
    setRecoveryEmail(email);
    setShowPassRecovery(true);
  };



  const handleShowVerificationMail = (email) => {
    console.log(email);
    setVerficationEmail(email)
    setShowVerificationMail(true);
  };
  const handleCloseVerificationMail = () => {
    setShowVerificationMail(false);
  };

  const goToLogin = () => {
    setCurrentComponent("login");
    setShowLogin(true);
  };

  // const handleCommingSoon = () =>{
  //   Navigate('/ComingSoon')
  // }




  const renderOffcanvasContent = () => {
    switch (currentComponent) {
      case "forgotPassword":
        return <ForgotPassword changeComponent={handleComponentChange} closeOffcanvas={closeOffcanvas} showPassRecovery={handleShowPassRecovery} />;
      case "register":
        return <Register changeComponent={handleComponentChange} closeOffcanvas={closeOffcanvas} showVerificationMail={handleShowVerificationMail} />;
      case "login":
        return <Login changeComponent={handleComponentChange} showLogin={handleShowLogin} closeOffcanvas={closeOffcanvas} />;
      case "passRecovery":
        return <PassRecovery changeComponent={handleComponentChange} closeOffcanvas={closeOffcanvas} handleClosePassRecovery={handleClosePassRecovery} goToLogin={goToLogin} />;
      default:
        return <Login changeComponent={handleComponentChange}  closeOffcanvas={closeOffcanvas} />;
    }
  };

  const getOffcanvasTitle = () => {
    switch (currentComponent) {
      case "forgotPassword":
        return "";
      case "register":
        return (
          <h3>Create an account</h3>

        );
      case "login":
      default:
        return (
          <span>
            <img src={logo} alt="" /> Sportsnerve
          </span>
        )
    }
  };





  const handleLogout = () => {
    localStorage.removeItem('inviteAccepted');
    dispatch(logout());
    Navigate("/");
  };

  const changePassword = () => {
    Navigate("/ChangePass")
  }

  // useEffect(() => {
  //   if (isLoggedIn) {
  //     // console.log("user data coming", user.data.user);
  //   }
  // }, [isLoggedIn, user]);


  useEffect(() => {
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

        {!isLoggedIn ? (
          <button className="navbar-toggler d-lg-none" type="button" onClick={handleShow}>
            <span className="navbar-toggler-icon"></span>
          </button>
        ) : (
          <div className="large-screen ">
            {/* <div>

              <li className="nav-item " style={{ listStyleType: "none" }}>
                <button className="btn"><img src={notification} alt="notification"  /></button>
              </li>
            </div> */}

            <div>

              <ul>
                <li className="nav-item  user-dropdown">
                  <div className="dropdown">
                    <button className="btn dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                      {user.data.user.profileImage ? (
                        <img src={user.data.user.profileImage} alt="user" className="user-profile-pic" />
                      ) : (
                        <img src={profile} alt="default user" className="user-profile-pic" /> // Provide the URL of your default image
                      )}
                      {user && user.data.user.fullName}
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="userDropdown">
                      <li><Link to={'/ViewProfile'} className="dropdown-item">View Profile</Link></li>
                      <li><button className="dropdown-item" onClick={changePassword}>Change Password</button></li>
                      <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        )}



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
                  <Link to={'size-chart/'} className="nav-link">{t('nav.link3')}</Link>
                </li>
                <li className="nav-item mx-3">
                  <Link to={'ContactPage'} className="nav-link">{t('nav.link4')}</Link>
                </li>
                <li className="nav-item mx-3 login-btn">
                  <button className="btn btn-danger login" 
                  onClick={handleShowLogin}
                  // onClick={handleCommingSoon}
                  
                  >
                    
                    {t('nav.link5')}</button>
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
                      {user.data.user.profileImage ? (
                        <img src={user.data.user.profileImage} alt="user" className="user-profile-pic" />
                      ) : (
                        <img src={profile} alt="default user" className="user-profile-pic" /> // Provide the URL of your default image
                      )}
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
          {!isLoggedIn ? (
            <ul className="navbar-nav ms-auto links-container">
              <li className="nav-item mx-3">
                <Link to={'Features'} className="nav-link">{t('nav.link1')}</Link>
              </li>
              <li className="nav-item mx-3">
                <Link to={'FAQPage'} className="nav-link">{t('nav.link2')}</Link>
              </li>
              <li className="nav-item mx-3">
                <Link to={'size-chart/'} className="nav-link">{t('nav.link3')}</Link>
              </li>
              <li className="nav-item mx-3">
                <Link to={'ContactPage'} className="nav-link">{t('nav.link4')}</Link>
              </li>
              <li className="nav-item mx-3 login-btn">
                <button className="btn btn-danger login" 
                onClick={handleShowLogin}
                // onClick={handleCommingSoon}
                >
                  {t('nav.link5')}</button>
              </li>
            </ul>
          ) : (
            <>

              {/* <li className=" nav-item mx-3">
                <button className="btn"><img src={notification} alt="notification" /></button>
              </li>
              <li className="nav-item mx-3 user-dropdown">
                <div className="dropdown">
                  <button className="btn dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    {user.data.user.profileImage ? (
                      <img src={user.data.user.profileImage} alt="user" className="user-profile-pic" />
                    ) : (
                      <img src={profile} alt="default user" className="user-profile-pic" /> // Provide the URL of your default image
                    )}
                    {user && user.data.user.fullName}
                  </button>
                  <ul className="dropdown-menu" aria-labelledby="userDropdown">
                    <li><Link to={'/ViewProfile'} className="dropdown-item">View Profile</Link></li>
                    <li><button className="dropdown-item" onClick={changePassword}>Change Password</button></li>
                    <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>

                  </ul>
                </div>
              </li> */}
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>




      {/* offcanvas for login */}
      <Offcanvas show={showLogin} onHide={handleCloseLogin} placement="end" className="login-offcanvas">
        <Offcanvas.Header >
          <Offcanvas.Title>{getOffcanvasTitle()} </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {renderOffcanvasContent()}
        </Offcanvas.Body>

      </Offcanvas>


      <Offcanvas show={showPassRecovery} onHide={handleClosePassRecovery} placement="end" className="login-offcanvas">
        <Offcanvas.Body>
          <PassRecovery email={recoveryEmail} closeOffcanvas={closeOffcanvas} handleClosePassRecovery={handleClosePassRecovery} goToLogin={goToLogin} />

        </Offcanvas.Body>
      </Offcanvas>



      <Offcanvas show={showVerificationMail} onHide={handleCloseVerificationMail} placement="end" className="login-offcanvas">
        <Offcanvas.Body>
          <VerifyMail email={vericationEmail} handleCloseVerificationMail={handleCloseVerificationMail} goToLogin={goToLogin} />

        </Offcanvas.Body>
      </Offcanvas>


    </nav>
  );
};

export default Navbar;
