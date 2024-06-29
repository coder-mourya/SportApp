// ForgotPassword.js
import React from 'react';
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css"; // Import the CSS file
import recover from "../../assets/afterLogin picks/Recover.png";
import bootmImg from "../../assets/afterLogin picks/grup.png";
// import mail from "../../assets/afterLogin picks/mail.png";
// import pen from "../../assets/afterLogin picks/pen.png";
import { BaseUrl } from '../../reducers/Api/bassUrl';
// import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
// import { useLocation } from 'react-router-dom';


const PendingMail = ({ handleClosePendingMail, email  }) => {
    
 
    const reSendLink = BaseUrl();


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
                toast.error(errorMessage);


            }
        } catch (error) {
            // console.error(error);

            toast.error('internal server error');

        }

    }





    return (
        <div className="ForgotPassword ">

            <div className="">

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
                        <p>  {email ? <p> {email}</p> : <p>Email not found.</p>}
                            {/* <img src={pen} alt="pen" /> */}
                             </p>
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
