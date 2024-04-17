// ForgotPassword.js
import React from 'react';
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css"; // Import the CSS file
import recover from "../../assets/afterLogin picks/Recover.png";
import bootmImg from "../../assets/afterLogin picks/grup.png";
import mail from "../../assets/afterLogin picks/mail.png";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';



const PassRecovery = () => {

    const Navigate = useNavigate();
    const handleClose = () =>{
        Navigate("/")
    }
    return (
        <div className="ForgotPassword container-fluid ">
            <div className="blur-background" onClick={handleClose}></div>
            <div className="container-right">

                <div className='container'>

                    <div className='text-center'>
                        <div className="forgot-password-img">

                            <img src={recover} alt="forgot password" />
                        </div>

                        <div className='cotainer '>

                            <h3 className="mb-3">Sent e-mail</h3>
                        </div>
                        <div className=''>

                            <p className='pb-0 mb-0'>We have sent the reset password link to
                            </p>
                        <p>sanju2171991@gmail.com</p>
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

                            <button type="submit" className="btn btn-danger py-3 login-botton mt-4">Resend</button>
                            <div className=' d-flex justify-content-center mt-4'>

                                <Link to={"/login"}>Back to login</Link>
                            </div>
                        </form>
                    </div>

                </div>
                <div className="login-bootm-img">
                    <img src={bootmImg} alt="group pick" className='custom-spacing' />
                </div>
            </div>
        </div>
    );
}

export default PassRecovery;
