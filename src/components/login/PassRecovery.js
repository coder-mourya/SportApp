// ForgotPassword.js
import React from 'react';
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css";
import recover from "../../assets/afterLogin picks/Recover.png";
import bootmImg from "../../assets/afterLogin picks/grup.png";
// import { Link } from 'react-router-dom';
import axios from 'axios';
import { BaseUrl } from '../../reducers/Api/bassUrl';
import Alerts from '../Alerts';
import { useState } from 'react';



const PassRecovery = ({ email, handleClosePassRecovery,  goToLogin }) => {


    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');




    const handleGoToLogin = () => {
        // console.log("goToLogin clicked");
        if (typeof goToLogin === 'function') {
            goToLogin();
            handleClosePassRecovery()
            
        } else {
            console.error('goToLogin is not a function');
        }
    };


    const handleResend = async () => {
        // console.log("resend clicked");
        const resendLink = BaseUrl();

        try {
            // Make a POST request to resend the email
            const response = await axios.post(`${resendLink}/api/v1/auth/sendLink`, {
                email: email
            });


            if (response.data.status === 200) {
                // console.log(response.data);
                const successMessage = response.data.errors ? response.data.errors.msg : 'Email sent successfully';

                setAlertMessage(successMessage);
                setAlertType('success');
               

            } else {

                const errorMessage = response.data.errors ? response.data.errors.msg : 'Error sending email';
                setAlertMessage(errorMessage);
                setAlertType('error');
            }

        } catch (error) {
            // Handle errors
            console.error('Error resending email:', error);
        }
    };


    return (
        <div className="ForgotPassword  ">

            <div className="">

                <div className='container'>

                    <div className='text-center'>
                        <div className="forgot-password-img">

                            <img src={recover} alt="forgot password" />
                        </div>

                        <div className='cotainer '>

                            <h3 className="mb-3">Sent e-mail</h3>
                        </div>
                        <div>

                            {email && (
                                <>
                                    <p className='pb-0 mb-0'>We have sent the reset password link to</p>
                                    <p className='mail'>{email}</p>
                                    {/* <p>email</p> */}
                                </>
                            )}

                        </div>

                        {alertMessage && <Alerts message={alertMessage} type={alertType} />}

                    </div>


                    <div className='p-md-4'>


                        <button type="submit" className="btn btn-danger py-2 login-botton mt-4" onClick={handleResend}>Resend</button>
                        <div className=' d-flex justify-content-center mt-4'>

                            
                            <button onClick={handleGoToLogin} className='text-decoration-none custom-color btn'>Go to Login</button>
                        </div>

                    </div>

                </div>
                <div className="login-bootm-img position-absolute bottom-0">
                    <img src={bootmImg} alt="group pick" className='custom-spacing' />
                </div>
            </div>
        </div>
    );
}

export default PassRecovery;
