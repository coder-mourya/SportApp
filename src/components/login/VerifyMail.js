// ForgotPassword.js
import React from 'react';
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css"; // Import the CSS file
import recover from "../../assets/afterLogin picks/Recover.png";
import bootmImg from "../../assets/afterLogin picks/grup.png";
// import mail from "../../assets/afterLogin picks/mail.png";
import { Link, useLocation } from 'react-router-dom';
import pen from "../../assets/afterLogin picks/pen.png";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BaseUrl } from '../../reducers/Api/bassUrl';
import Alerts from '../Alerts';
import { useState } from 'react';





const VerifyMail = () => {

    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');

    const location = useLocation();
    const email = location.state?.email;

    const Navigate = useNavigate();

    const reSendLink = BaseUrl();
    const handleResendVerification = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${reSendLink}/api/v1/auth/resend/mail-verification/link`, {
                email: email

            })

            if (response.data.status === 200) {
                console.log(response.data);

                const successMessage = response.data.errors ? response.data.errors.msg : 'Email sent successfully';
                setAlertMessage(successMessage);
                setAlertType('success');
            } else {
                console.log(response.data);

                const errorMessage = response.data.errors ? response.data.errors.msg : 'Error sending email';
                setAlertMessage(errorMessage);
                setAlertType('error');
            }
        } catch (error) {
            console.error(error);
            setAlertMessage('internal server error');
            setAlertType('error');
        }

    }


    const handleClose = () => {
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

                            <h3 className="mb-3">Verify your e-mail</h3>
                        </div>
                        <div className=' d-flex justify-content-center'>

                            <p className='pb-0'>You will need to verify your e-mail address to
                                complete registration
                            </p>
                        </div>
                        <p>  {email ? <p> {email}</p> : <p>Email not found.</p>}
                            <img src={pen} alt="pen" /> </p>
                    </div>
                    {alertMessage && <Alerts message={alertMessage} type={alertType} />}

                    <div className='p-md-4'>

                        <form onSubmit={handleResendVerification}>
                            {/* <div className="mb-3">
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
                            </div> */}

                            <button type="submit" className="btn btn-danger py-3 login-botton mt-4">Resend</button>
                            <div className=' d-flex justify-content-center mt-4'>

                                <Link to={"/login"}>Back to login</Link>
                            </div>
                        </form>
                    </div>

                </div>
                <div className="login-bootm-img position-absolute bottom-0">
                    <img src={bootmImg} alt="group pick" />
                </div>
            </div>
        </div>
    );
}

export default VerifyMail;
