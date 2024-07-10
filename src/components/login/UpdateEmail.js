// ForgotPassword.js
import React from 'react';
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css"; // Import the CSS file
import recover from "../../assets/afterLogin picks/Recover.png";
import bootmImg from "../../assets/afterLogin picks/grup.png";
import mail from "../../assets/afterLogin picks/mail.png";
// import { useLocation } from 'react-router-dom';
// import pen from "../../assets/afterLogin picks/pen.png";
import axios from 'axios';
import { BaseUrl } from '../../reducers/Api/bassUrl';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import Alerts from '../Alerts';


const UpdateEmail = ({ handleCloseUpdateEmail, goToLogin, provider_id, fullName }) => {
    // console.log("provider id ", provider_id, "fullName ", fullName);
    const [formData, setFormData] = useState({
        email: '',
        fullName: fullName,
        provider_id: provider_id
    })

    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');




    const handleGoToLogin = () => {
        if (typeof goToLogin === 'function') {
            goToLogin();
            handleCloseUpdateEmail();
        } else {
            console.error('goToLogin is not a function');
        }
    };



    const updateEmail = BaseUrl();
    const handleUpdateEmail = async (e) => {
        e.preventDefault();

        console.log("update email ", formData);
        try {
            const response = await axios.post(`${updateEmail}/api/v1/auth/updateProfileEmail`, {
                email: formData.email,
                fullName: formData.fullName,
                provider_id: formData.provider_id
            })

            if (response.data.status === 200) {
                console.log(response.data.data.message);
                const message = response.data.data.message;
                toast.success(message);
                setTimeout(() =>{
                    handleCloseUpdateEmail();
                }, 3000)
            } else {
                console.log(response.data);
                const errorMessage = response.data.errors ? response.data.errors.msg : 'Error sending email';
                setAlertMessage(errorMessage);
                setAlertType('error');
            }
        } catch (error) {
            // console.error(error);
            toast.error('internal server error');
        }

    }

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };




    return (
        <div className="ForgotPassword  ">

            <div className="">
            {alertMessage && <Alerts message={alertMessage} type={alertType} />}


                <div className='container'>
                    <ToastContainer />
                    <div className='text-center'>
                        <div className="forgot-password-img">

                            <img src={recover} alt="forgot password" />
                        </div>

                        <div className='cotainer '>

                            <h3 className="mb-3">Update your Email</h3>
                        </div>
                        <div className=' d-flex justify-content-center'>

                            <p className='pb-0'>You will need to Update  your e-mail address to
                                complete registration
                            </p>
                        </div>

                    </div>


                    <div className=''>

                        <form onSubmit={handleUpdateEmail}>
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
                                        className="form-control pe-2"
                                        id="email"
                                        aria-describedby="emailHelp"
                                        placeholder="Email address"
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-danger py-2 login-botton mt-4">Update</button>
                            <div className=' d-flex justify-content-center mt-4'>


                                <button onClick={handleGoToLogin} type='button' className='text-decoration-none custom-color btn'>Go to Login</button>
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

export default UpdateEmail;
