// ForgotPassword.js
import React from 'react';
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css"; // Import the CSS file
import forgot from "../../assets/afterLogin picks/forgot.png";
import bootmImg from "../../assets/afterLogin picks/grup.png";
import mail from "../../assets/afterLogin picks/mail.png";
import { useNavigate } from "react-router-dom";


const ForgotPassword = () => {



    const navigate = useNavigate();


    const handlesendEmail = () => {
        navigate('/PassRecovery');
    };


    return (
        <div className="ForgotPassword container-fluid ">
            <div className="blur-background"></div>
            <div className="container-right">

                <div className='container'>

                    <div className='text-center'>
                        <div className="forgot-password-img">

                            <img src={forgot} alt="forgot password" />
                        </div>

                        <div className='cotainer '>

                            <h3 className="mb-3">Forgot Password ?</h3>
                        </div>
                        <div className=' d-flex justify-content-center'>

                            <p className="mb-3 w-50">To reset your password, please enter your
                                email address</p>
                        </div>
                    </div>


                    <div className='p-md-4'>

                        <form>
                            <div className="mb-3">
                                <label htmlFor="exampleInputEmail1" className="form-label">
                                    Email address
                                </label>
                                <div className="input-group my-1">
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

                            <button type="submit" className="btn btn-danger py-3 login-botton mt-4" onClick={handlesendEmail}>Send Link</button>
                        </form>
                    </div>

                </div>
                <div className="login-bootm-img">
                    <img src={bootmImg} alt="group pick" />
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
