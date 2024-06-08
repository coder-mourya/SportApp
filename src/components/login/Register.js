import React, { useEffect } from 'react';
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css";
import password from "../../assets/afterLogin picks/password.png"
import mail from "../../assets/afterLogin picks/mail.png";
import name from "../../assets/afterLogin picks/name.png";
import nickname from "../../assets/afterLogin picks/name.png";
import mobile from "../../assets/afterLogin picks/mobile.png";
import axios from "axios";
import { BaseUrl } from '../../reducers/Api/bassUrl';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer, toast } from 'react-toastify';



const Register = ({ changeComponent, closeOffcanvas, showVerificationMail }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        nickname: "",
        email: "",
        mobile: "",
        dateOfBirth: "",
        gender: "",
        password: "",
        countryCode: "",
        phoneCode: "",
        phoneNumericCode: "",
        termsChecked: false,
        userType: "user",
        deviceType: "android",
    });

    const [countryList, setCountryList] = useState([]);
    const [passwordError, setPasswordError] = useState('');
    const [passwordTimeout, setPasswordTimeout] = useState(null);





    // Password Validation
    const ValidatePassword = (password) => {
        const minLength = 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) {
            return `password must be at least ${minLength} characters`;

        } else if (!hasLowercase) {
            return `password must contain at least one lowercase letter`;
        } else if (!hasUppercase) {
            return `password must contain at least one uppercase letter`;
        } else if (!hasNumber) {
            return `password must contain at least one number`;
        } else if (!hasSpecialChar) {
            return `password must contain at least one special character`;
        } else {
            return '';
        }
    }


    useEffect(() => {
        return () => {
            if (passwordTimeout) {
                clearTimeout(passwordTimeout);
            }
        };
    }, [passwordTimeout]);



    // Register 
    const handleRegister = async (e) => {

        e.preventDefault();


        const passwordValidationError = ValidatePassword(formData.password);
        if (passwordValidationError) {
            setPasswordError(passwordValidationError);
            return;
        }
        console.log("form submitting data", formData)
        const register = BaseUrl()
        const sendVerification = BaseUrl()

        try {
            const response = await axios.post(`${register}/api/v1/auth/register`, formData);

            if (response.data.status === 200) {
                toast.success('Registration successful');
                console.log('Registration successful:', response.data);

                await axios.post(`${sendVerification}/api/v1/auth/send/mail-verification/link`, {
                    email: formData.email
                });


                showVerificationMail(formData.email)

                closeOffcanvas();

            } else {
                const errorMessage = response.data.errors ? response.data.errors.msg : 'Error registering user';
                toast.error(errorMessage);

                console.error('Error registering user:', response.data);
            }

        } catch (error) {
            console.error('internal server error:', error);
            toast.error('internal server error');
        }


    }





    useEffect(() => {

        // get countory list
        const getCountry = async () => {

            const countoryUrl = BaseUrl()

            try {
                const response = await axios.get(`${countoryUrl}/api/v1/auth/country_list`)



                setCountryList(response.data.data.country_list);

                // console.log(response.data);

            } catch (error) {
                console.log("Error fetching country list:", error);
            }

        }

        getCountry();
    }, [])




    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (name === "password") {
            if (passwordTimeout) {
                clearTimeout(passwordTimeout);
            }
            const timeout = setTimeout(() => {
                const error = ValidatePassword(value);
                setPasswordError(error);
            }, 1000);
            setPasswordTimeout(timeout);
        }


    };

    const handleCountryCods = (e) => {
        const selectedCountryCode = e.target.value;

        const selectedCountry = countryList.find(
            (country) => country.phoneCode === selectedCountryCode
        );

        if (selectedCountry) {

            setFormData((prevFormData) => ({
                ...prevFormData,
                countryCode: selectedCountry.phoneCode,
                phoneCode: selectedCountry.phoneCode,
                phoneNumericCode: selectedCountry.numeric_code,
            }));
        } else {
            console.log("Selected Country is undefined");
        }
    };





    const handleDateChange = (date) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            dateOfBirth: date,
        }));
    };


    return (
        <div>

            <div className="Create-account">

                <div className="">
                    <div className='container account_info'>





                        <div className=''>
                            <ToastContainer />

                            <form onSubmit={handleRegister}  >
                                {/* Input fields */}

                                <div className='register-form'>
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">Full Name</label>
                                        <div className="input-group my-1">
                                            <span className="input-group-text">
                                                <img src={name} alt="name" />
                                            </span>
                                            <input type="text" className="form-control" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Enter your Full name" />
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

                                            <select
                                                className="contury-code"
                                                value={formData.phoneCode}
                                                onChange={handleCountryCods}
                                                name="countryCode"
                                            >
                                                {countryList.map((country) => (
                                                    <option
                                                        key={country.code}
                                                        value={country.phoneCode}
                                                        title={country.name}
                                                    >
                                                        {`+${country.phoneCode} ${country.name}`}
                                                    </option>
                                                ))}
                                            </select>



                                            <input type="text" className="form-control mobile-number" id="mobile" name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="Enter your mobile number" />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="dob" className="form-label">Date of Birth</label>

                                        <div className="input-group my-1 " onClick={() => document.getElementById('dateOfBirth').click()}>
                                            {/* <span className="input-group-text">
                                                <img src={dob} alt="password" />
                                            </span> */}
                                            <DatePicker
                                                selected={formData.dateOfBirth}
                                                onChange={handleDateChange}
                                                dateFormat="MM/dd/yyyy"
                                                className="form-control "
                                                id="dateOfBirth"
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                                placeholderText="Select your date of birth"
                                                prepend
                                            />
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
                                        {passwordError && <p className="text-danger">{passwordError}</p>}
                                    </div>




                                    <div className="mb-3 form-check">
                                        <input type="checkbox" className="form-check-input" id="terms" name="termsChecked" checked={formData.termsChecked} onChange={handleInputChange} />
                                        <label className="form-check-label" htmlFor="terms">I agree to the terms and conditions</label>
                                    </div>

                                </div>

                                <div className='Register-button'>
                                    <button type="submit" className="btn  py-2  mt-4">Create an account</button>
                                </div>


                            </form>

                            <div className="mt-2 text-center">
                                <p>Already have an account?
                                    <button
                                        type="button"
                                        onClick={() => changeComponent("login")}
                                        className="text-decoration-none custom-color btn btn-link"
                                    >
                                        Login
                                    </button>
                                </p>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



export default Register;
