import React, { useState } from 'react';
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css"; // Import the CSS file
import forgot from "../../assets/afterLogin picks/forgot.png";
import bootmImg from "../../assets/afterLogin picks/grup.png";
import mail from "../../assets/afterLogin picks/mail.png";
import axios from 'axios';
import { BaseUrl } from "../../reducers/Api/bassUrl";
import Alerts from '../Alerts';


const ForgotPassword = ({ closeOffcanvas, showPassRecovery , goToLogin }) => {
    const [email, setEmail] = useState('');
  
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');
  

    const handlesendEmail = async (e) => {
        e.preventDefault();
        const reSetLink = BaseUrl();

        const formData = new FormData()

        formData.append('email', email)

     

        try {
            const response = await axios.post(`${reSetLink}/auth/sendLink`, formData);

            if (response.data.status === 200) {
                console.log(response.data);
                const successMessage = response.data.errors ? response.data.errors.msg : 'Email sent successfully';
                setAlertMessage(successMessage);
                setAlertType('success');
                showPassRecovery(email);
                // closeOffcanvas();
            } else {
                const errorMessage = response.data.errors ? response.data.errors.msg : 'Error sending email';
                setAlertMessage(errorMessage);
                setAlertType('error');
            }

        } catch (error) {
            console.log(error);
            setAlertMessage('internal server error');
            setAlertType('error');
        }
    };

    return (
        <div className="ForgotPassword register-prosess">
            {/* Forgot password UI */}
            <div className="">
                <div className='container'>
                    <div className='text-center'>
                        <div className="forgot-password-img d-flex justify-content-center">
                            <img src={forgot} alt="forgot password" />
                        </div>
                        <div className='cotainer  d-flex justify-content-center'>
                            <h3 className="mb-3">Forgot Password ?</h3>
                        </div>
                        <div className='d-flex justify-content-center'>
                            <p className="mb-3 w-75">To reset your password, please enter your email address</p>
                        </div>
                    </div>
                    <div className=''>
                        <form onSubmit={handlesendEmail}>
                            <div className="mb-3">
                                <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
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
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            {alertMessage && <Alerts message={alertMessage} type={alertType} />}
                            <button type="submit" className="btn btn-danger py-2 login-botton mt-4">Send Link</button>
                        </form>
                    </div>
                </div>
                <div className="login-bootm-img position-absolute bottom-0">
                    <img src={bootmImg} alt="group pick" className='custom-spacing' />
                </div>
            </div>

        </div>
    );
}

export default ForgotPassword;
