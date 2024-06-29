import React, { useEffect } from 'react';
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css";
import password from "../../assets/afterLogin picks/password.png"
import dob from "../../assets/afterLogin picks/dob.png"
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
import { Link } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';




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

    // const [countryList, setCountryList] = useState([]);
    const [passwordError, setPasswordError] = useState('');
    const [passwordTimeout, setPasswordTimeout] = useState(null);
    const [errors, setErrors] = useState({});

    const isSelected = formData.gender !== '';



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

        const newErrors = {};

        // Check for empty fields
        Object.keys(formData).forEach((key) => {
            if (formData[key] === "" && key !== "termsChecked" && key !== "countryCode" && key !== "phoneCode" && key !== "phoneNumericCode") {
                newErrors[key] = `${key} is required`;
            }
        });


        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            
        } else {
            setErrors({});
        }

        const passwordValidationError = ValidatePassword(formData.password);
        if (passwordValidationError) {
            setPasswordError(passwordValidationError);
            return;
        }
        // console.log("form submitting data", formData)
        const register = BaseUrl()


        try {
            const response = await axios.post(`${register}/api/v1/auth/register`, formData);

            if (response.data.status === 200) {
                // console.log('Registration successful:', response.data);
                localStorage.setItem('userData', JSON.stringify(response.data.data));


                closeOffcanvas();
                showVerificationMail(formData.email)
                toast.success('Registration successful');

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









    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: type === "checkbox" ? checked : value,
        }));

      
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name] : undefined,
        }))

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







    const handleDateChange = (date) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            dateOfBirth: date,
        }));
    };

    const handlePhoneChange = (value, country) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            mobile: value,
            phoneCode: country.dialCode,
            phoneNumericCode: country.dialCode,
            countryCode: country.dialCode,

        }));
    };


    return (

        <div>

            <div className="Create-account">

                <div className="">
                    <div className='container account_info'>

                        <ToastContainer />
                        <div className=''>


                            <form onSubmit={handleRegister}  >
                                {/* Input fields */}

                                <div className='register-form'>
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">Full Name</label>
                                        <div className="input-group my-1">
                                            <span className="input-group-text">
                                                <img src={name} alt="name" />
                                            </span>
                                            <input type="text" className={`form-control pe-2 ${errors.fullName ? 'is-invalid' : ''}`} id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Enter your Full name" />
                                            {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="nickname" className="form-label">Nickname</label>
                                        <div className="input-group my-1">
                                            <span className="input-group-text">
                                                <img src={nickname} alt="nickname" />
                                            </span>
                                            <input type="text" className="form-control pe-2" id="nickname" name="nickname" value={formData.nickname} onChange={handleInputChange} placeholder="Enter your nickname" />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email Address</label>
                                        <div className="input-group my-1">
                                            <span className="input-group-text">
                                                <img src={mail} alt="email" />
                                            </span>
                                            <input type="email" className={`form-control pe-2 ${errors.email ? 'is-invalid' : ''}`} id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email address" />
                                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="mobile" className="form-label">Mobile Number</label>
                                        <div className="input-group my-1 ">
                                            <span className="input-group-text">
                                                <img src={mobile} alt="mobile" />
                                            </span>


                                            <PhoneInput
                                                style={{ padding: "0px" }}
                                                country={"in"}
                                                className={`form-control mobile-number ${errors.mobile ? 'is-invalid' : ''}`}
                                                id="mobile"
                                                name="mobile"
                                                value={formData.mobile}
                                                onChange={handlePhoneChange}
                                                placeholder="Enter your mobile number"
                                                enableSearch={true}
                                                scrollableCountry={true}
                                                searchPlaceholder="Search Country"

                                            />

                                            {errors.mobile && <div className="invalid-feedback">{errors.mobile}</div>}


                                        </div>
                                    </div>



                                    <div className="mb-3">
                                        <label htmlFor="dob" className="form-label">Date of Birth</label>

                                        <div className="input-group my-1  "
                                        //  onClick={() => document.getElementById('dateOfBirth').click()}
                                        >
                                            <span className="input-group-text "
                                                style={{ height: "55px" }}
                                            >
                                                <img src={dob} alt="password" />
                                            </span>
                                            <DatePicker
                                                type="date"
                                                selected={formData.dateOfBirth}
                                                onChange={handleDateChange}
                                                dateFormat="MM/dd/yyyy"
                                                className={`form-control ${errors.dateOfBirth ? 'is-invalid' : ''}`}
                                                id="dateOfBirth"
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                                placeholderText="Select your date of birth"


                                            />

                                            {errors.dateOfBirth && <div className="invalid-feedback">{errors.dateOfBirth}</div>}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="gender" className="form-label">Gender</label>
                                        <div className="input-group my-1">
                                            <select
                                                className={`form-select ${isSelected ? 'selected' : 'placeholder'}`}

                                                id="gender" name="gender" value={formData.gender} onChange={handleInputChange}
                                                style={{
                                                    height: "55px",

                                                }}

                                                placeholder="Select gender"
                                            >
                                                <option value=""  >Select gender</option>
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
                                            <input type="password" className="form-control pe-2" id="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Enter your password" />
                                        </div>
                                        {passwordError && <p className="text-danger">{passwordError}</p>}
                                    </div>




                                    <div className="mb-3 form-check">
                                        <input type="checkbox" className="form-check-input" id="terms" name="termsChecked" checked={formData.termsChecked} onChange={handleInputChange} />
                                        <label className="form-check-label" htmlFor="terms">I agree to the <Link to={"/terms-and-conditions/"}
                                            style={{ color: "#283593", textDecoration: "none" }}
                                        >terms & conditions</Link> and <Link to={"/privacy-policy/"} style={{ color: "#283593", textDecoration: "none" }}> privacy policy</Link></label>
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
