import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/Styles/AfterLogin/loggedInHome.css";
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css";

import { useSelector } from 'react-redux';
import Sidebar from "../../components/AfterLogin/Sidebar";
import SidebarSmallDevice from "../../components/AfterLogin/SidebarSmallDevice";
import arrow from "../../assets/afterLogin picks/My team/arrow.svg";
import { Link } from "react-router-dom";
import Offcanvas from 'react-bootstrap/Offcanvas';
import Alerts from "../Alerts";
import { BaseUrl } from "../../reducers/Api/bassUrl";
import axios from "axios";
import { useEffect } from "react";



import mail from "../../assets/afterLogin picks/mail.png";
import name from "../../assets/afterLogin picks/name.png";
import nickname from "../../assets/afterLogin picks/name.png";
import mobile from "../../assets/afterLogin picks/mobile.png";
import dob from "../../assets/afterLogin picks/dob.png";


const ViewProfile = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        nickName: "",
        email: "",
        mobile: "",
        dob: "",
        gender: "",
        country: "",
        state: "",
        city: "",
        countryCode: "",
        phoneCode: "",
        phoneNumericCode: "",
        termsChecked: false,
    });
    const user = useSelector(state => state.auth.user);
    // const dispatch = useDispatch();
    const [profileImage, setProfileImage] = useState("");
    const fileInuptRef = useRef(null);
    const [mainContainerClass, setMainContainerClass] = useState("col-md-11");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [countryList, setCountryList] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');
    const [fileSetected, setFileSelected] = useState(false)
    const token = useSelector(state => state.auth.user.data.user.token);



    // show current user data
    useEffect(() => {
        if (user && user.data.user) {
            const { fullName, nickName, email, mobile, dateOfBirth, gender, country, state, city, countryCode, phoneCode, phoneNumericCode, termsChecked } = user.data.user;

            setFormData({
                fullName: fullName || "",
                nickName: nickName || "",
                email: email || "",
                mobile: mobile || "",
                dateOfBirth: dateOfBirth || "",
                gender: gender || "",
                country: country || "",
                state: state || "",
                city: city || "",
                countryCode: countryCode || "",
                phoneCode: phoneCode || "",
                phoneNumericCode: phoneNumericCode || "",
                termsChecked: termsChecked || false,
            })
        }
    }, [user])


    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
        setMainContainerClass(sidebarOpen ? "col-md-11" : "col-md-10");
    };


    const Navigate = useNavigate();

    const handleCrose = () => {
        Navigate("/LoggedInHome");
    };


    // formate date of birth to dd/mm/yyyy
    const formatDateOfBirth = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };


    const handleProfilePictureChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                setProfileImage(event.target.result);
                // console.log("message ", event.target.result);
                setFileSelected(true)
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadProfilePicture = async (e) => {
        e.preventDefault();

        if (fileInuptRef?.current?.files[0]) {
            let file = fileInuptRef.current.files[0];
            //   console.log("message :" ,fileInuptRef.current.files);
            //   console.log('Selected file:', file); 

            let formData = new FormData();

            formData.append('profileImage', file
                //   {
                //     name: file.name,
                //     type: file.type,
                //     // uri: file.uri,
                //     size: file.size,
                // }
            );

            formData.append('fullName', user.data.user.fullName)
            formData.append('mobile', user.data.user.mobile)
            formData.append('dateOfBirth', user.data.user.dateOfBirth)


            // console.log('FormData contents:', ...formData);

            const uploadProfilePicture = BaseUrl();


            try {
                
                // console.log('what data sednibg to server:', JSON.stringify(formData));
                // console.log('what data sednibg to server:', ...formData);

                const response = await axios.post(`${uploadProfilePicture}/api/v1/user/update/profile`,formData,  {
                   
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    },

                    // body : formData

                });

                console.log('FormData after appending file:', JSON.stringify(formData)); 

                if (response.data.status === 200) {
                    setAlertMessage('Profile picture uploaded successfully');
                    setAlertType('success');
                    console.log('Profile picture uploaded successfully:', response.data);

                    const navigateDelay = () => Navigate('/ViewProfile');
                    setTimeout(navigateDelay, 2000);
                } else {
                    console.error('Error uploading profile picture:', response.data);
                    const errorMessage = response.data ? response.data.message : 'Error uploading profile picture';
                    setAlertMessage(errorMessage);
                    setAlertType('error');
                }
            } catch (error) {
                console.error('Internal server error while uploading profile picture:', error);
            }
        } else {
            console.log('No file selected');
        }
    };

    const triggerFileInputClick = () => {
        fileInuptRef.current.click();
    };









    // save changes
    const handleSaveChanges = async (e) => {

        e.preventDefault();
        console.log("form submitting data", formData)
        const updateProfile = BaseUrl()

        const token = user.data.user.token;

        try {
            const response = await axios.post(`${updateProfile}/api/v1/user/update/profile`, formData
                , {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.status === 200) {
                setAlertMessage('Profile updated successfully');
                setAlertType('success');
                console.log('Profile updated successfully:', response.data);
                const naviGateDelay = () => {
                    Navigate("/ViewProfile");
                }

                setTimeout(naviGateDelay, 2000);


            } else {
                const errorMessage = response.data ? response.data.message : 'Error registering user';
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

    const handleCountryChange = (e) => {
        const selectedCountryCode = e.target.value;
        const selectedCountry = countryList.find(
            (country) => country.countryCode === selectedCountryCode
        );

        if (selectedCountry) {
            setFormData((prevFormData) => ({
                ...prevFormData,
                countryCode: selectedCountry.countryCode,
            }));
        }
    };


    useEffect(() => {

        getCountry();


    }, [])

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


    return (
        <div className="container-fluid bodyColor ">
            <div className="row">
                <div className="col">
                    <Sidebar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                    <SidebarSmallDevice />
                </div>
                <div className={`${mainContainerClass} main mt-5`}>
                    <div className="profile-container">
                        <div className="d-flex  justify-content-between">
                            <div className=" d-flex">
                                <button className="btn prev-button" onClick={handleCrose}>
                                    <img src={arrow} alt="previous" />
                                </button>

                                <h4 className="ms-3 mt-md-1">My profile</h4>
                            </div>

                            <div className="me-4">
                                <button className="btn  btn-danger" onClick={handleShow}>Edit profile</button>
                            </div>
                        </div>

                        <div className="profile itemsColor my-4 rounded-4 ">

                            <form onSubmit={handleUploadProfilePicture}>
                                <div className="profile-picture p-4 d-flex justify-content-start align-items-center">
                                    {profileImage ? (
                                        <img src={profileImage} alt="Profile" className="profile-img rounded-circle" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                                    ) : (
                                        <div className="profile-placeholder bg-secondary text-white d-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px', borderRadius: '50%' }}>
                                            Profile Picture
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProfilePictureChange}
                                        ref={fileInuptRef}
                                        value={profileImage.formData}
                                        className="upload-input position-absolute bottom-0 end-0"
                                        style={{ width: '24px', height: '24px', opacity: 0, cursor: 'pointer' }}

                                    />

                                    <Link className="ms-3" onClick={triggerFileInputClick}>upload image</Link>
                                    {fileSetected && (
                                        <button className="btn btn-danger ms-4" type="submit">upload</button>
                                    )}
                                </div>
                            </form>


                            {alertMessage && <Alerts message={alertMessage} type={alertType} />}


                            <div className="profile-details p-4">
                                <div className="row ">
                                    <div className="col-md-3 mb-2 ">
                                        <p>Name</p>
                                        <p>{user.data.user.fullName}</p>
                                    </div>

                                    <div className="col-md-3 mb-2">
                                        <p>Nickname</p>
                                        <p>{user.data.user.nickName}</p>

                                    </div>

                                    <div className="col-md-3 mb-2">
                                        <p>Email address</p>
                                        <p>{user.data.user.email}</p>
                                    </div>

                                    <div className="col-md-3 mb-2">
                                        <p>Gender</p>
                                        <p>{user.data.user.gender}</p>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-3 mb-2">
                                        <p>Mobile number</p>
                                        <p>{user.data.user.mobile}</p>
                                    </div>

                                    <div className="col-md-3 mb-2">
                                        <p>Date of Birth</p>
                                        <p>{formatDateOfBirth(user.data.user.dateOfBirth)}</p>
                                    </div>

                                    <div className="col-md-3 mb-2">
                                        <p>Country</p>
                                        <p>{user.data.user.country}</p>
                                    </div>

                                    <div className="col-md-3 mb-2">
                                        <p>State</p>
                                        <p>{user.data.user.state}</p>
                                    </div>


                                </div>

                                <div className="row">
                                    <div className="col-md-3 mb-2">
                                        <p>City</p>
                                        <p>{user.data.user.city}</p>
                                    </div>
                                </div>
                            </div>


                            <Offcanvas show={show} onHide={handleClose} placement="end">
                                <Offcanvas.Header closeButton>
                                    <Offcanvas.Title>Edit profile</Offcanvas.Title>

                                </Offcanvas.Header>

                                <Offcanvas.Body>
                                    <form onSubmit={handleSaveChanges}>
                                        <div className="edit-profile">
                                            {/* Input fields */}
                                            <div className="mb-3">
                                                <label htmlFor="name" className="form-label">Full Name</label>
                                                <div className="input-group my-1">
                                                    <span className="input-group-text">
                                                        <img src={name} alt="name" />
                                                    </span>
                                                    <input type="text"
                                                        className="form-control"
                                                        id="fullName"
                                                        name="fullName"
                                                        value={formData.fullName}

                                                        onChange={handleInputChange}
                                                        placeholder="Enter your Full name"
                                                    />
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor="nickname" className="form-label">Nickname</label>
                                                <div className="input-group my-1">
                                                    <span className="input-group-text">
                                                        <img src={nickname} alt="nickname" />
                                                    </span>
                                                    <input type="text" className="form-control" id="nickName" name="nickName" value={formData.nickName} onChange={handleInputChange} placeholder="Enter your nickname" />
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
                                                        value={formData.countryCode}
                                                        onChange={handleCountryChange}
                                                        name="countryCode"
                                                    >
                                                        {countryList.map((country) => (
                                                            <option
                                                                key={country.code}
                                                                value={country.countryCode}
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
                                            {alertMessage && <Alerts message={alertMessage} type={alertType} />}

                                        </div>

                                    </form>

                                </Offcanvas.Body>

                                <div className='edit-button text-center mb-2'>
                                    <button type="submit" className="btn  py-2  mt-4" onClick={handleSaveChanges}>Save Changes</button>
                                </div>
                            </Offcanvas>


                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default ViewProfile;
