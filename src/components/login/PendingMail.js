// ForgotPassword.js
import React from 'react';
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css"; // Import the CSS file
import recover from "../../assets/afterLogin picks/Recover.png";
import bootmImg from "../../assets/afterLogin picks/grup.png";
import { BaseUrl } from '../../reducers/Api/bassUrl';
import axios from 'axios';
import {  ToastContainer, toast } from 'react-toastify';
import Alerts from '../Alerts';
import { useState } from 'react';


const PendingMail = ({ handleClosePendingMail, email }) => {
    const reSendLink = BaseUrl();
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');

    const handleResendVerification = async (e) => {
        e.preventDefault();


        try {
            const response = await axios.post(`${reSendLink}/api/v1/auth/send/mail-verification/link`, {
                email: email
            }


            )

            
                if (response.data.status === 200) {
                    // console.log(response.data);
                    const successMessage = response.data.errors ? response.data.errors.msg : 'Email sent successfully';
                    toast.success(successMessage);
                    handleClosePendingMail();
                } else {
                    console.log(response.data);
                    const errorMessage = response.data.errors ? response.data.errors.msg : 'Error sending email';
                   setAlertMessage(errorMessage);
                   setAlertType('error');
                }
            
        } catch (error) {
            // console.error(error);
            setAlertMessage('internal server error');
            setAlertType('error');
        }

    }





    return (
        <div className="ForgotPassword ">

            <div className="">

                <div className='container'>

                {alertMessage && <Alerts message={alertMessage} type={alertType} />}

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
                        <p>  {email ? <p> {email}</p> : <p>Email not found.</p>}
                            {/* <img src={pen} alt="pen" /> */}
                        </p>
                    </div>


                    <div className='p-md-4'>

                        <form>

                            <ToastContainer />

                            <button type="submit" className="btn btn-danger py-2 login-botton mt-4" onClick={handleResendVerification}>Resend</button>
                            <div className=' d-flex justify-content-center mt-4'>

                                <button onClick={(e) => { e.preventDefault(); handleClosePendingMail(); }} className='text-decoration-none custom-color btn'>
                                    Go to Login
                                </button>

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
