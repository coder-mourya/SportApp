import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css";
import bootmImg from "../../assets/afterLogin picks/grup.png";
import mail from "../../assets/afterLogin picks/mail.png";
import passwordImg from "../../assets/afterLogin picks/password.png";
import { useNavigate } from "react-router-dom";
import { BaseUrl } from "../../reducers/Api/bassUrl";
import axios from "axios";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const Navigate = useNavigate();

  const loginUrl = `${BaseUrl}/api/v1/auth/login`;

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(loginUrl, { email, password });

      console.log(response.data);
      // Redirect to home page after successful login
      Navigate("/LoggedInHome");
    } catch (error) {
      // Handle login error
      console.error("Error logging in:", error);
    }
  };

  const handleCrose = () => {
    Navigate("/");
  };

  return (
    <div className="Login container-fluid">
      <div className="blur-background" onClick={handleCrose}></div>

      <div className="container-right">
        <div className="container">
          <div className="mt-5">
            <h3 className="mb-4">Login</h3>
          </div>

          <div className="p-md-4">
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <img src={mail} alt="mail" />
                  </span>
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
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <img src={passwordImg} alt="password" />
                  </span>
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
              <div className="mb-3 text-end ">
                <Link
                  to={"/ForgotPassword"}
                  className=" text-decoration-none custom-color"
                >
                  Forgot password ?
                </Link>
              </div>
              <button
                type="submit"
                className="btn btn-danger py-2 login-botton"
              >
                Login
              </button>
              <div className="mt-3 text-center">
                <p>
                  Don't have an account?{" "}
                  <Link
                    to={"/Register"}
                    className=" text-decoration-none custom-color"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
        <div className="login-bootm-img  position-fixed bottom-0">
          <img src={bootmImg} alt="group pick" className="custom-spacing" />
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
