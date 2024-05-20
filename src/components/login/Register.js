import React, { useEffect } from 'react';
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css";
import password from "../../assets/afterLogin picks/password.png"
import mail from "../../assets/afterLogin picks/mail.png";
import name from "../../assets/afterLogin picks/name.png";
import nickname from "../../assets/afterLogin picks/name.png";
import mobile from "../../assets/afterLogin picks/mobile.png";
import dob from "../../assets/afterLogin picks/dob.png";
// import gender from "../../assets/afterLogin picks/name.png";
import {  useNavigate } from 'react-router-dom';
import axios from "axios";
import { BaseUrl } from '../../reducers/Api/bassUrl';
import { useState } from 'react';
import Alerts from "../Alerts";
// import { connect } from 'react-redux';

// import 'react-country-flag-select/dist/index.css'; 
// import CountryFlagSelect from "react-country-flag";


const Register = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        nickname: "",
        email: "",
        mobile: "",
        dateOfBirth: "",
        gender: "",
        password: "",
        country: "",
        state: "",
        city: "",
        countryCode: "",
        phoneCode: "",
        phoneNumericCode: "",
        termsChecked: false,
        userType: "user",  
        deviceType: "android",
    });

    const [countryList, setCountryList] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');

    // const location = useLocation()
    // const {email} = location.state;

    const Navigate = useNavigate();





    // Register 
    const handleRegister = async (e) => {

        e.preventDefault();
        console.log("form submitting data", formData)
        const register = BaseUrl()
        const sendVerification = BaseUrl()

        try {
            const response = await axios.post(`${register}/api/v1/auth/register`, formData);

            if (response.data.status === 200) {
                setAlertMessage('Registration successful');
                setAlertType('success');
                console.log('Registration successful:', response.data);

                await axios.post(`${sendVerification}/api/v1/auth/send/mail-verification/link`, {
                    email: formData.email
                });

                const navigateDelay = () => Navigate('/VerifyMail', { state: { email: formData.email } } );
                setTimeout(navigateDelay, 2000);

                
            } else {
                const errorMessage = response.data.errors ? response.data.errors.msg : 'Error registering user';
                setAlertMessage(errorMessage);
                setAlertType('error');

                console.error('Error registering user:', response.data);
            }

        } catch (error) {
            console.error('internal server error:', error);
            setAlertMessage('internal server error', error.msg);
            setAlertType('error');
        }


    }



    useEffect(() => {

        getCountry();


    }, [])

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


    // get state 

    const getState = async (countryId) => {
        const stateUrl = BaseUrl(); // Changed variable name to stateUrl

        try {
            const response = await axios.get(`${stateUrl}/api/v1/auth/state_list/${countryId}`);

            setStates(response.data.data.state_list);
            console.log(response.data);
        } catch (error) {
            console.log("Error fetching state list:", error);
        }
    };



    const getCity = async (stateId) => {
        const citiUrl = BaseUrl();

        try {
            const response = await axios.get(`${citiUrl}/api/v1/auth/city_list/${stateId}`)
            setCities(response.data.data.city_list);
            console.log(response.data);
        } catch (error) {
            console.log("error detching cities :", error);
        }

    }




    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: type === "checkbox" ? checked : value,
        }));


        if (name === "country") {
            const selectCountry = e.target.options[e.target.selectedIndex].getAttribute("data-country-id")
            getState(selectCountry);
        }

        if (name === "state") {
            const selectState = e.target.options[e.target.selectedIndex].getAttribute("data-state-id")
            getCity(selectState)
        }


    };

    const handleCountryCods = (e) => {
        const selectedCountryCode = e.target.value;
        // console.log("Selected Country Code:", selectedCountryCode);
        // console.log("Country List:", countryList);

        // Print each country for detailed inspection
        // countryList.forEach(country => {
        //     console.log(`Country: ${country.name}, Country Code: ${country.phoneCode}, Phone Code: ${country.phoneCode}, Phone Numeric Code: ${country.numeric_code}`);
        // });

        const selectedCountry = countryList.find(
            (country) => country.phoneCode === selectedCountryCode
        );

        if (selectedCountry) {
            // console.log("Selected Country Details:", {
            //     countryCode: selectedCountry.phoneCode,
            //     phoneCode: selectedCountry.phoneCode,
            //     phoneNumericCode: selectedCountry.numeric_code,
            // });

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






    const handleCrose = () => {
        Navigate("/")
    }
    return (
        <div>

            <div className="Create-account container-fluid ">
                <div className="blur-background" onClick={handleCrose}></div>
                <div className="container-right">
                    <div className='container account_info'>
                        <div className='cotainer mt-3 d-flex justify-content-between'>
                            <h3 className="mb-3">Create an account</h3>


                        </div>

                        {alertMessage && <Alerts message={alertMessage} type={alertType} />}


                        <div className='p-md-4'>

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
                                        <div className="input-group my-1">
                                            <span className="input-group-text">
                                                <img src={dob} alt="dob" />
                                            </span>
                                            <input type="date" className="form-control" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} />
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
                                                    <option key={index} value={country.code} data-country-id={country.id}>{country.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="state" className="form-label">State</label>
                                        <div className="input-group my-1">
                                            <select className="form-select" id="state" name="state" value={formData.state} onChange={handleInputChange}>
                                                <option>Select state</option>

                                                {states.map((state) => (
                                                    <option key={state._id} value={state.id} data-state-id={state.id}>{state.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="city" className="form-label">City</label>
                                        <div className="input-group my-1">
                                            <select className="form-select" id="city" name="city" value={formData.city} onChange={handleInputChange}>
                                                <option>Select city</option>

                                                {cities.map((city) => (
                                                    <option key={city._id} value={city.id} data-state-id={city.id}>{city.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3 form-check">
                                        <input type="checkbox" className="form-check-input" id="terms" name="termsChecked" checked={formData.termsChecked} onChange={handleInputChange} />
                                        <label className="form-check-label" htmlFor="terms">I agree to the terms and conditions</label>
                                    </div>
                                    {/* {alertMessage && <Alerts message={alertMessage} type={alertType} />} */}
                                </div>

                                <div className='Register-button'>
                                    <button type="submit" className="btn  py-3  mt-4">Create an account</button>
                                </div>


                            </form>


                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


// const mapStateToProps = (state) => {
//     return {
//         isLoggedIn: state.auth.isLoggedIn, // Accessing auth reducer's isLoggedIn state
//         // Add more state properties as needed
//     };
// };



// export default connect(mapStateToProps)(Register);
export default Register;
