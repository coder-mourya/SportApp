import React, { useEffect } from 'react';
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css";
import password from "../../assets/afterLogin picks/password.png"
import mail from "../../assets/afterLogin picks/mail.png";
import name from "../../assets/afterLogin picks/name.png";
import nickname from "../../assets/afterLogin picks/name.png";
import mobile from "../../assets/afterLogin picks/mobile.png";
import dob from "../../assets/afterLogin picks/dob.png";
// import gender from "../../assets/afterLogin picks/name.png";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { BaseUrl } from '../../reducers/Api/bassUrl';
import { useState } from 'react';


const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        nickname: "",
        email: "",
        mobile: "",
        dob: "",
        gender: "",
        password: "",
        country: "",
        state: "",
        city: "",
        termsChecked: false,
    });

    const [countryList, setCountryList] = useState([]);
    const Navigate = useNavigate();


    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    
    // Register 
    const handleRegister = async () => {
        const Url = BaseUrl();
        
       

        const registerUrl = `${Url}/api/v1/auth/register`;
        const sendVerification = `${Url}/api/v1/auth/send/mail-verification/link`

        try {
            const response = await axios.post(registerUrl, formData)

            console.log('Registration successful:', response.data);

            await axios.post(sendVerification, {
                email: formData.email
            });

            Navigate("/VerifyMail");

        } catch (error) {
            console.error('Error registering user:', error);
        }

    }

    useEffect(() => {

        // get countory list
        const getCountry = async () => {

            const countoryUrl = BaseUrl()

            try {
                const response = await axios.get(`${countoryUrl}/api/v1/auth/country_list`)

                

                setCountryList(response.data.data.country_list);

                console.log(response.data);

            } catch (error) {
                console.log("Error fetching country list:", error);
            }

        }


        // get state 

        

        getCountry();
    }, [])


    const handleCrose = () => {
        Navigate("/")
    }
    return (
        <div className="Create-account container-fluid ">
            <div className="blur-background" onClick={handleCrose}></div>
            <div className="container-right">
                <div className='container account_info'>
                    <div className='cotainer mt-3 d-flex justify-content-between'>
                        <h3 className="mb-3">Create an account</h3>


                    </div>
                    <div className='p-md-4'>
                        <form onSubmit={handleRegister}>
                            {/* Input fields */}
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">Name</label>
                                <div className="input-group my-1">
                                    <span className="input-group-text">
                                        <img src={name} alt="name" />
                                    </span>
                                    <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your name" />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="nickname" className="form-label">Nickname</label>
                                <div className="input-group my-1">
                                    <span className="input-group-text">
                                        <img src={nickname} alt="nickname" />
                                    </span>
                                    <input type="text" className="form-control" id="nickname" name="nickname" value={formData.nickname} onChange={handleInputChange} placeholder="Enter your nickname" />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email Address</label>
                                <div className="input-group my-1">
                                    <span className="input-group-text">
                                        <img src={mail} alt="email" />
                                    </span>
                                    <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email address" />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="mobile" className="form-label">Mobile Number</label>
                                <div className="input-group my-1">
                                    <span className="input-group-text">
                                        <img src={mobile} alt="mobile" />
                                    </span>
                                    <input type="text" className="form-control" id="mobile" name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="Enter your mobile number" />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="dob" className="form-label">Date of Birth</label>
                                <div className="input-group my-1">
                                    <span className="input-group-text">
                                        <img src={dob} alt="dob" />
                                    </span>
                                    <input type="date" className="form-control" id="dob" name="dob" value={formData.dob} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="gender" className="form-label">Gender</label>
                                <div className="input-group my-1">
                                    <select className="form-select" id="gender" name="gender" value={formData.gender} onChange={handleInputChange}>
                                        <option>Select gender</option>
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Password</label>
                                <div className="input-group my-1">
                                    <span className="input-group-text">
                                        <img src={password} alt="password" />
                                    </span>
                                    <input type="password" className="form-control" id="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Enter your password" />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="country" className="form-label">Country</label>
                                <div className="input-group my-1">
                                    <select className="form-select" id="country" name="country" value={formData.country} onChange={handleInputChange}>
                                        <option>Select country</option>

                                        {countryList.map((country, index) => (
                                            <option key={index} value={country.code}>{country.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="state" className="form-label">State</label>
                                <div className="input-group my-1">
                                    <select className="form-select" id="state" name="state" value={formData.state} onChange={handleInputChange}>
                                        <option>Select state</option>

                                        {/* Add options for states */}
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="city" className="form-label">City</label>
                                <div className="input-group my-1">
                                    <select className="form-select" id="city" name="city" value={formData.city} onChange={handleInputChange}>
                                        <option>Select city</option>

                                        {/* Add options for cities */}
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3 form-check">
                                <input type="checkbox" className="form-check-input" id="terms" name="termsChecked" checked={formData.termsChecked} onChange={handleInputChange} />
                                <label className="form-check-label" htmlFor="terms">I agree to the terms and conditions</label>
                            </div>
                            <button type="submit" className="btn btn-danger py-3 login-botton mt-4">Create an account</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
