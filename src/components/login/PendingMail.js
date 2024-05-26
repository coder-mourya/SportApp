// ForgotPassword.js
import React from 'react';
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css"; // Import the CSS file
import recover from "../../assets/afterLogin picks/Recover.png";
import bootmImg from "../../assets/afterLogin picks/grup.png";
// import mail from "../../assets/afterLogin picks/mail.png";
import { Link, useLocation } from 'react-router-dom';
import pen from "../../assets/afterLogin picks/pen.png";
import { useNavigate } from 'react-router-dom';
import Alerts from '../Alerts';
import { BaseUrl } from '../../reducers/Api/bassUrl';
import { useState } from 'react';
import axios from 'axios';





const PendingMail = () => {

    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');
    const reSendLink = BaseUrl();

    const location = useLocation();
    const email = location.state?.email;

    const Navigate = useNavigate();
    const handleClose = () => {
        Navigate("/")
    }


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

                            <h3 className="mb-3">Pending verification</h3>
                        </div>
                        <div className=' d-flex justify-content-center'>

                            <p className='pb-0'>Your verification is pending. Please check your E-mail
                                and complete your registration
                            </p>
                        </div>
                        <p className='text-dark'> {email} <img src={pen} alt="pen" /></p>
                    </div>


                    <div className='p-md-4'>

                        <form>
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

                    {alertMessage && <Alerts alertMessage={alertMessage} alertType={alertType} />}


                            <button type="submit" className="btn btn-danger py-3 login-botton mt-4" onClick={handleResendVerification}>Resend</button>
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

export default PendingMail;
