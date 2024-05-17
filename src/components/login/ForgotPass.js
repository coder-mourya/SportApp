// ForgotPassword.js
import React, { useState } from 'react';
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css"; // Import the CSS file
import forgot from "../../assets/afterLogin picks/forgot.png";
import bootmImg from "../../assets/afterLogin picks/grup.png";
import mail from "../../assets/afterLogin picks/mail.png";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { BaseUrl } from "../../reducers/Api/bassUrl";
import Alerts from '../Alerts';


const ForgotPassword = () => {

    const [email, setEmail] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');

    const Navigate = useNavigate();


    const handlesendEmail = async (e) => {
        e.preventDefault();
        const reSetLink = BaseUrl()

        try {
            const response = await axios.post(`${reSetLink}/api/v1/auth/sendLink`, {
                email: email
            });

           if(response.data.status === 200){
            setEmail(response.data.email)
            console.log(response.data);

            const successMessage = response.data.errors ? response.data.errors.msg : 'Email sent successfully';

            setAlertMessage(successMessage);
            setAlertType('success');


            Navigate('/PassRecovery', {state : {email}});
           }else{

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

    const handleClose = () => {
        Navigate("/")

    }


    return (
        <div className="ForgotPassword container-fluid ">
            <div className="blur-background" onClick={handleClose}></div>
            <div className="container-right">

                <div className='container'>

                    <div className='text-center'>
                        <div className="forgot-password-img d-flex justify-content-center">

                            <img src={forgot} alt="forgot password" />
                        </div>

                        <div className='cotainer  d-flex justify-content-center'>

                            <h3 className="mb-3">Forgot Password ?</h3>
                        </div>
                        <div className='d-flex justify-content-center'>

                            <p className="mb-3 w-75">To reset your password, please enter your
                                email address</p>
                        </div>
                    </div>


                    <div className='p-md-4'>

                        <form onSubmit={handlesendEmail}>
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
