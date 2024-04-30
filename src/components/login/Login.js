import React from "react";
import { Link } from "react-router-dom";
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css";
import bootmImg from "../../assets/afterLogin picks/grup.png";
import mail from "../../assets/afterLogin picks/mail.png";
import password from "../../assets/afterLogin picks/password.png";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const Navigate = useNavigate()

  const handleCrose = () => {
    Navigate("/")
  }

  const handleLogin = () => {
    Navigate("/LoggedInHome")
  }

  return (
    <div className="Login container-fluid">
      <div className="blur-background" onClick={handleCrose}></div>

      <div className="container-right">
        <div className="container">
          <div className="mt-5">

            <h3 className="mb-4">Login</h3>


          </div>


          <div className="p-md-4">
            <form>
              <div className="mb-3">
                <label htmlFor="exampleInputEmail1" className="form-label">
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
                    aria-describedby="emailHelp"
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
                    <img src={password} alt="password" />
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Password"
                  />
                </div>
              </div>
              <div className="mb-3 text-end ">
                <Link to={"/ForgotPassword"} className=" text-decoration-none custom-color">Forgot password ?</Link>
              </div>
              <button type="submit" className="btn btn-danger py-2 login-botton" onClick={handleLogin}>
                Login
              </button>
              <div className="mt-3 text-center">
                <p>Don't have an account? <Link to={"/Register"} className=" text-decoration-none custom-color">Sign Up</Link></p>
              </div>
            </form>
          </div>
        </div>
        <div className="login-bootm-img  position-absolute bottom-0">
          <img src={bootmImg} alt="group pick" className="custom-spacing" />
        </div>
      </div>
    </div>
  );
};

export default LoginForm;