import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/Styles/AfterLogin/loggedInHome.css";
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css";
import defaultProfileImage from "../../assets/afterLogin picks/home/profile.jpg";

import { useSelector } from 'react-redux';
import Sidebar from "../../components/AfterLogin/Sidebar";
import SidebarSmallDevice from "../../components/AfterLogin/SidebarSmallDevice";
import arrow from "../../assets/afterLogin picks/My team/arrow.svg";
import { Link } from "react-router-dom";
import Offcanvas from 'react-bootstrap/Offcanvas';
import { BaseUrl } from "../../reducers/Api/bassUrl";
import axios from "axios";
import { useEffect } from "react";
import { updateProfile } from "../../reducers/authSlice";
import { useDispatch } from "react-redux";


import mail from "../../assets/afterLogin picks/mail.png";
import name from "../../assets/afterLogin picks/name.png";
import nickname from "../../assets/afterLogin picks/name.png";
import mobile from "../../assets/afterLogin picks/mobile.png";
import dob from "../../assets/afterLogin picks/dob.png";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer, toast } from "react-toastify";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css';



const ViewProfile = () => {
    const [formData, setFormData] = useState({
        profileImage: null,
        fullName: "",
        nickName: "",
        email: "",
        mobile: "",
        dob: "",
        gender: "",
        // country: "",
        // state: "",
        // city: "",
        countryCode: "",
        phoneCode: "",
        phoneNumericCode: "",
        termsChecked: false,
    });
    const user = useSelector(state => state.auth.user);
    const dispatch = useDispatch();
    const [profileImage, setProfileImage] = useState("");
    const fileInuptRef = useRef(null);
    const [mainContainerClass, setMainContainerClass] = useState("col-md-11");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [fileSetected, setFileSelected] = useState(false)
    const token = useSelector(state => state.auth.user.data.user.token);


    // console.log("check what coming ", user.data.user);



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


    useEffect(() => {
        if (user && user.data.user.profileImage) {
            setProfileImage(user.data.user.profileImage);
        }
    }, [user]);


    // console.log("user data" , user.data.user);


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

        let file = fileInuptRef.current.files[0];

        let formData = new FormData();
        formData.append('profileImage', file);

        // Append each field separately to the FormData

        formData.append('fullName', user.data.user.fullName);
        formData.append('mobile', user.data.user.mobile);
        formData.append('dateOfBirth', user.data.user.dateOfBirth);

        const uploadProfilePicture = BaseUrl();
        // console.log("form data ", formData);
        try {
            const response = await axios.post(`${uploadProfilePicture}/user/update/profile`,

                formData
                ,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    },
                }
            );

            if (response.data.status === 200) {


                console.log('Profile picture uploaded successfully:', response.data);
                toast.success('Profile picture uploaded successfully');


                const updatedUserData = {
                    ...user.data.user,
                    ...formData
                };
                // console.log("updated user data ", updatedUserData);
                dispatch(updateProfile(updatedUserData));


            } else {
                console.error('Error uploading profile picture:', response.data);
                const errorMessage = response.data ? response.data.message : 'Error uploading profile picture';
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error('Internal server error while uploading profile picture:', error);
            toast.error('Internal server error while uploading profile picture');
        }

    };



    const triggerFileInputClick = () => {
        fileInuptRef.current.click();
    };




    // save changes
    const handleSaveChanges = async (e) => {
        e.preventDefault();
        const updateProfileUrl = BaseUrl();
        const token = user?.data?.user?.token;

        try {
            const response = await axios.post(
                `${updateProfileUrl}/user/update/profile`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.status === 200) {
                // Dispatch updateProfile action to update profile in Redux store
                const updatedUserData = {
                    ...user.data.user,
                    ...formData,
                };
                dispatch(updateProfile(updatedUserData));

                toast.success('Profile updated successfully');
                // console.log("Profile updated successfully:", response.data);
                handleClose();
            } else {
                const errorMessage = response.data.errors ? response.data.errors.msg : "Error updating profile";
                toast.error(errorMessage);
                console.error("Error updating profile:", response.data);
            }
        } catch (error) {
            // console.error("Internal server error:", error);
            toast.error('Internal server error while updating profile');
        }
    };


    const handleDateChange = (date) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            dateOfBirth: date,
        }));
    };



    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: type === "checkbox" ? checked : value,
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
                                    <img
                                        src={profileImage || defaultProfileImage}
                                        alt="Profile"
                                        className="profile-img rounded-circle"
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                    />
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


                            <ToastContainer />


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



                                </div>

                            </div>


                            <Offcanvas show={show} onHide={handleClose} placement="end">
                                <Offcanvas.Header closeButton>
                                    <Offcanvas.Title>Edit profile</Offcanvas.Title>

                                </Offcanvas.Header>

                                <Offcanvas.Body>
                                    <form onSubmit={handleSaveChanges}>
                                        <div className="edit-profile register-prosess">
                                            {/* Input fields */}
                                            <div className="mb-3">
                                                <label htmlFor="name" className="form-label">Full Name</label>
                                                <div className="input-group my-1">
                                                    <span className="input-group-text">
                                                        <img src={name} alt="name" />
                                                    </span>
                                                    <input type="text"
                                                        className="form-control pe-2"
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
                                                    <input type="text" className="form-control pe-2" id="nickName" name="nickName" value={formData.nickName} onChange={handleInputChange} placeholder="Enter your nickname" />
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor="email" className="form-label">Email Address</label>
                                                <div className="input-group my-1">
                                                    <span className="input-group-text">
                                                        <img src={mail} alt="email" />
                                                    </span>
                                                    <input 
                                                    style={{cursor:"not-allowed"}}
                                                    type="email" className="form-control text-muted pe-2" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email address"
                                                        readOnly
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <label htmlFor="mobile" className="form-label">Mobile Number</label>
                                                <div className="input-group my-1">
                                                    <span className="input-group-text">
                                                        <img src={mobile} alt="mobile" />
                                                    </span>

                                                    <PhoneInput
                                                        style={{ padding: "0px" }}
                                                        country={"in"}
                                                        className={`form-control mobile-number `}
                                                        id="mobile"
                                                        name="mobile"
                                                        value={formData.mobile}
                                                        onChange={handlePhoneChange}
                                                        placeholder="Enter your mobile number"
                                                        enableSearch={true}
                                                        scrollableCountry={true}
                                                        searchPlaceholder="Search Country"
                                                    />


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
                                                        className=" "
                                                        id="dateOfBirth"
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dropdownMode="select"
                                                        placeholderText="Select your date of birth"

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

                                            <div className="mb-3 form-check">
                                                <input type="checkbox" className="form-check-input" id="terms" name="termsChecked" checked={formData.termsChecked} onChange={handleInputChange} />
                                                <label className="form-check-label" htmlFor="terms">I agree to the terms and conditions</label>
                                            </div>


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
