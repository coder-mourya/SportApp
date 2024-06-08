// components/LoginForm.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css";
import bootmImg from "../../assets/afterLogin picks/grup.png";
import mail from "../../assets/afterLogin picks/mail.png";
import passwordImg from "../../assets/afterLogin picks/password.png";
import axios from "axios";
import Alerts from "../Alerts";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../reducers/authSlice";
import { BaseUrl } from "../../reducers/Api/bassUrl";
import Offcanvas from "react-bootstrap/Offcanvas";
import PendingMail from "./PendingMail";


const LoginForm = ({ changeComponent, closeOffcanvas }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const loginUrl = BaseUrl();

  const [showPendingMail, setShowPendingMail] = useState(false);

  const handleClosePendingMail = () => setShowPendingMail(false);
  const handleShowPendingMail = () => setShowPendingMail(true);

  const handleLogin = async (e) => {
    e.preventDefault();

    const provider = '';
    const provider_id = "";

    try {
      const response = await axios.post(`${loginUrl}/api/v1/auth/login`,


        { email, password, provider, provider_id });


      if (response.data.status === 200) {
        const checkVerify = response.data.data;

        if (checkVerify.isEmailVerify === false) {
          setAlertMessage('Email not verified. Please check your inbox.');
          setAlertType('error');
          handleShowPendingMail({ state: { email: email } });
          return;
        } else {

          console.log(response.data);
          dispatch(loginSuccess(response.data));
          setAlertMessage('Login successful');
          setAlertType('success');

          // check sports selection 
          const userData = response.data.data.user;
          if (userData.sportsSelection === true) {
            navigate('/loggedInHome');

          } else {
            navigate('/Category');

          }
        }

        closeOffcanvas();

      } else {
        const errorMessage = response.data.errors ? response.data.errors.msg : 'Error logging in user';
        setAlertMessage(errorMessage);
        setAlertType('error');
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setAlertMessage('Error logging in user');
      setAlertType('error');
    }
  };



  return (
    <div className="Login ">

      <div className="">
        <div className="container">
          <div className="mt-1">
            <h3 className="mb-4">Login</h3>
          </div>
          <div className="">
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email address</label>
                <div className="input-group">
                  <span className="input-group-text"><img src={mail} alt="mail" /></span>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-group">
                  <span className="input-group-text"><img src={passwordImg} alt="password" /></span>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                  />
                </div>
              </div>
              <div className="mb-3 text-end">
                {/* <Link to="/ForgotPassword" className="text-decoration-none custom-color">Forgot password?</Link> */}
                <button
                  type="button"
                  onClick={() => changeComponent("forgotPassword")}
                  className="text-decoration-none custom-color btn btn-link"
                >
                  Forgot password?
                </button>
              </div>
              <button type="submit" className="btn btn-danger py-2 login-botton">Login</button>
              <div className="mt-3 text-center">
                <p>Don't have an account?
                  <button
                    type="button"
                    onClick={() => changeComponent("register")}
                    className="text-decoration-none custom-color btn btn-link"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
              {alertMessage && <Alerts message={alertMessage} type={alertType} />}
            </form>
          </div>
        </div>
        <div className="login-bootm-img position-fixed bottom-0">
          <img src={bootmImg} alt="group pick" className="custom-spacing" />
        </div>
      </div>

      <Offcanvas show={showPendingMail} onHide={handleClosePendingMail} placement="end">
      
      <Offcanvas.Body>
        <PendingMail email={email} /> 
      </Offcanvas.Body>

    </Offcanvas>
    </div>

    
  );
};

export default LoginForm;
