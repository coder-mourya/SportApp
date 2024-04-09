import React from "react";
import { Link } from "react-router-dom";
import "../../assets/Styles/AfterLogin/login.css";
import grup from "../../assets/afterLogin picks/grup.png";
import mail from "../../assets/afterLogin picks/mail.png";
import password from "../../assets/afterLogin picks/password.png";

const LoginForm = () => {
  return (
    <div className="Login container-fluid">
      <div>
        <h3 className="mb-4">Login</h3>
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
            <label htmlFor="exampleInputPassword1" className="form-label">
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
            <Link to={"forgetPassword"} className=" text-decoration-none">Forgot password ?</Link>
          </div>
          <button type="submit" className="btn btn-danger py-2 login-botton">
            Login
          </button>
          <div className="mt-3 text-center">
            <p>Don't have an account? <Link to={"singUp"} className=" text-decoration-none">Sign Up</Link></p>
          </div>
        </form>
      </div>
      <div className="login-bootm-img">
        <img src={grup} alt="group pick" />
      </div>
    </div>
  );
};

export default LoginForm;
