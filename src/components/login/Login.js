// components/LoginForm.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css";
import mail from "../../assets/afterLogin picks/mail.png";
import apple from "../../assets/afterLogin picks/apple.png";
import facebook from "../../assets/afterLogin picks/facebook.svg";
import google from "../../assets/afterLogin picks/google.png";
import passwordImg from "../../assets/afterLogin picks/password.png";
import axios from "axios";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../reducers/authSlice";
import { BaseUrl } from "../../reducers/Api/bassUrl";
import Offcanvas from "react-bootstrap/Offcanvas";
import PendingMail from "./PendingMail";
import { ToastContainer, toast } from "react-toastify";
import { useGoogleLogin } from "@react-oauth/google";
import FacebookLogin from "react-facebook-login";
// import AppleLogin from 'react-apple-login';
import { jwtDecode } from "jwt-decode";
import UpdateEmail from "./UpdateEmail";
import AppleSignin from "react-apple-signin-auth";



const LoginForm = ({ changeComponent, closeOffcanvas, goToLogin }) => {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [provider_id, setProvider_id] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();
  // const [aapleUserInfo, setAppleUserInfo] = useState({});

  const dispatch = useDispatch();
  const loginUrl = BaseUrl();

  const [showPendingMail, setShowPendingMail] = useState(false);

  const handleClosePendingMail = () => {
    setShowPendingMail(false)
  };
  // const handleShowPendingMail = () => setShowPendingMail(true);

  const handleShowPendingMail = ({ email }) => {
    // console.log(email);
    setEmail(email);
    setUserId(userId);
    setShowPendingMail(true);
  };

  const [emailUpdate, setEmailUpdate] = useState(false);

  const handleShowUpdateEmail = ({ provider_id, fullName }) => {
    setFullName(fullName);
    setProvider_id(provider_id);
    setEmailUpdate(true);
  };

  const handleCloseUpdateEmail = () => {
    setEmailUpdate(false);
  };



  const handleLogin = async (e) => {
    e.preventDefault();
    // console.log("run normal login");

    const provider = '';
    const provider_id = "";



    try {
      const response = await axios.post(`${loginUrl}/auth/login`,


        { email, password, provider, provider_id });


      if (response.data.status === 200) {
        const checkVerify = response.data.data;


        if (checkVerify.isEmailVerify === false) {

          // toast('Email not verified. Please check your inbox.');

          handleShowPendingMail({ email });
          return;

        } else {

          // console.log(response.data);
          dispatch(loginSuccess(response.data));
          toast.success('Login Successful')

          const teamId = localStorage.getItem('teamId');

          if (teamId) {
            localStorage.removeItem('teamId');
            navigate("/TeamDashbord", { state: { teamID: teamId } });
          } else {
            navigate("/LoggedInHome");

          }

          const eventId = localStorage.getItem('eventId');
          if (eventId) {

            localStorage.removeItem('eventId');
            navigate("/EventDetails", { state: { eventId: eventId } });
          } else {

            navigate("/LoggedInHome");
          }
        }

        closeOffcanvas();

      } else {
        const errorMessage = response.data.errors ? response.data.errors.msg : 'Error logging in user';
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error("internal server error :", error);
      toast.error("internal server error")

    }
  };



  const handleGoogleLoginSuccess = async (userInfo) => {
    //  console.log("userInfo", userInfo);

    try {

      let provider_id = userInfo.sub;
      const email = userInfo.email;
      const res = await axios.post(`${loginUrl}/auth/login`, {
        provider: 'google',
        provider_id: provider_id,
        email: email,
        password: '12345',
      });


      if (res.data.status === 200) {
        // console.log("response google " , res.data);
        {
          dispatch(loginSuccess(res.data));
          toast.success('Login Successful');
          const teamId = localStorage.getItem('teamId');
          if (teamId) {
            localStorage.removeItem('teamId');
            navigate("/TeamDashbord", { state: { teamID: teamId } });
          } else {
            navigate("/LoggedInHome");
          }
        }
        closeOffcanvas();
      } else {
        const errorMessage = res.data.errors ? res.data.errors.msg : 'Error logging in user';
        toast.error(errorMessage);
        console.log("error", res.data);
      }
    } catch (error) {
      console.error("internal server error :", error);
      toast.error("internal server error");
    }
  };


  const singIn = useGoogleLogin({
    onSuccess: async tokenResponse => {
      // console.log(tokenResponse);

      try {
        const userInfo = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          }
        })

        console.log(userInfo.data);
        handleGoogleLoginSuccess(userInfo.data);
      } catch (error) {
        console.error(error);
      }
    },

    onError: () => toast.error("Google Login Failed"),
  })




  const handleFacebookLogin = async (response) => {
    // console.log(response);

    if (response.accessToken) {
      const email = response.email;
      let provider_id = response.userID;
      const fullName = response.name;
      // console.log("email", email,"provider_id", provider_id, "name ", fullName);

      try {
        const res = await axios.post(`${loginUrl}/auth/login`, {
          provider: 'facebook',
          provider_id: provider_id,
          password: '12345',
          email: email,
        });

        if (res.data.status === 200) {
          const checkVerify = res.data.data.user;
          // console.log("check verify ", checkVerify);
          if (!checkVerify.email) {
            handleShowUpdateEmail({ provider_id, fullName });
            return;
          } else if (checkVerify.isEmailVerify === false) {
            handleShowPendingMail({ email });
          } else {

            dispatch(loginSuccess(res.data));
            toast.success('Login Successful');
            // console.log("response facebook ", res.data.data);

            const teamId = localStorage.getItem('teamId');
            if (teamId) {
              localStorage.removeItem('teamId');
              navigate("/TeamDashbord", { state: { teamID: teamId } });
            } else {
              navigate("/LoggedInHome");
            }

            closeOffcanvas();
          }
        } else {
          const errorMessage = res.data.errors ? res.data.errors.msg : 'Error logging in user';
          toast.error(errorMessage);
        }
      } catch (error) {
        console.error("internal server error :", error);
        toast.error("internal server error");
      }
    }
  };


  const handleAppleLogin = async (response) => {
    // console.log("aaple response ", response);

    if (response.authorization) {
      const idToken = response.authorization.id_token;
      const decodedToken = jwtDecode(idToken);
      console.log("decoded token", decodedToken);
      const provider_id = decodedToken.sub;
      const email = decodedToken.email;
      // const name = decodedToken.name;
      // console.log("provider_id", provider_id);

      const loginData = {
        provider: 'apple',
        provider_id: provider_id,
        password: '12345',
      }

      if (email) {
        loginData.email = email;
      }

      try {
        const res = await axios.post(`${loginUrl}/auth/login`, loginData);

        if (res.data.status === 200) {

          const checkVerify = res.data.data.user;
          console.log("check verify ", checkVerify);
          if (!checkVerify.email) {
            handleShowUpdateEmail({ provider_id, fullName });
            return;
          } else if (checkVerify.isEmailVerify === false) {
            handleShowPendingMail({ email });
          } else {
            dispatch(loginSuccess(res.data));
            toast.success('Login Successful');
            const teamId = localStorage.getItem('teamId');
            if (teamId) {
              localStorage.removeItem('teamId');
              navigate("/TeamDashbord", { state: { teamID: teamId } });
            } else {
              navigate("/LoggedInHome");
            }

            closeOffcanvas();
          }
        } else {
          const errorMessage = res.data.errors ? res.data.errors.msg : 'Error logging in user';
          toast.error(errorMessage);
        }
      } catch (error) {
        console.error("internal server error :", error);
        toast.error("internal server error");
      }
    }
  };



  return (
    <div className="Login register-prosess">

      <div className="mt-0">
        <div className="container">
          <ToastContainer />
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
                    className="form-control pe-2"
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
                    className="form-control pe-2"
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

              <div className="my-4 d-flex justify-content-center align-items-center text-center">
                <div className="login-line"></div>
                <p className="mx-2" style={{ color: "#4F5163" }}>Or</p>
                <div className="login-line"></div>
              </div>

              <p className="text-center" style={{ color: "#4F5163" }}> Continue with</p>

              <div className="d-flex justify-content-around">

                <FacebookLogin
                  containerStyle={{ height: "40px", width: "40px" }}
                  appId="464951399466662"
                  autoLoad={false}
                  fields="name,email,picture"
                  callback={handleFacebookLogin}
                  usePopup={true}
                  icon={<img src={facebook} alt="facebook"
                    style={{
                      paddingTop: "10px",
                      width: "12px",
                    }}
                  />}
                  onFailure={(error) => {
                    // console.error("Facebook Login Failed:", error);
                    toast.error("Facebook Login Failed");
                  }}
                />




                <button onClick={singIn}
                  type="button"
                  style={{ backgroundColor: '#FDEBE9', border: 'none', borderRadius: "50%", width: "40px", height: "40px" }}
                >
                  <img src={google} alt="Login with Google"
                    style={{
                      paddingTop: "0",
                      width: "18px",
                    }}
                  />
                </button>



                <AppleSignin

                  authOptions={{
                    clientId: "com.sportsnerve.web.sid",
                    redirectURI: "https://dainty-gelato-b56a78.netlify.app/",
                    responseType: "code",
                    scope: "email name",
                    responseMode: "query",
                    nonce: 'nonce',
                    state: 'state',
                    usePopup: true,
                  }}
                  onSuccess={handleAppleLogin}
                  // onSuccess={(response) => console.log(response)}
                  onError={(error) => {
                    console.error("Apple Login Failed:", error);
                    toast.error("Apple Login Failed");
                  }}

                  render={({ onClick }) => (
                    <button onClick={onClick} style={{ backgroundColor: '#ccc', border: 'none', borderRadius: "50%", width: "40px", height: "40px" }}>
                      <img src={apple} alt="apple login"
                        style={{
                          paddingTop: "0",
                          width: "20px",
                        }}
                      />
                    </button>
                  )}

                />
              </div>

              <div className="mt-3 text-center">
                <p>Don't have an account?
                  <button
                    type="button"
                    onClick={() => changeComponent("register")}
                    className="text-decoration-none custom-color btn btn-link"
                    style={{
                      paddingTop: "0",
                    }}
                  >
                    Sign Up
                  </button>
                </p>
              </div>

            </form>
          </div>
        </div>

      </div>

      <Offcanvas show={showPendingMail} onHide={handleClosePendingMail} placement="end">

        <Offcanvas.Body>
          <PendingMail email={email} userId={userId} handleClosePendingMail={handleClosePendingMail} />
        </Offcanvas.Body>

      </Offcanvas>

      <Offcanvas show={emailUpdate} onHide={handleCloseUpdateEmail} placement="end">

        <Offcanvas.Body>
          <UpdateEmail provider_id={provider_id} fullName={fullName} handleCloseUpdateEmail={handleCloseUpdateEmail} />
        </Offcanvas.Body>

      </Offcanvas>
    </div>


  );
};

export default LoginForm;
