import React from "react";
// import { useNavigate } from "react-router-dom";
import "../../../assets/Styles/AfterLogin/Addmember.css";
import uploadIcon from "../../../assets/afterLogin picks/My team/upload-icon.svg";
import admin_selected from "../../../assets/afterLogin picks/My team/admin_selected.svg";
import admin from "../../../assets/afterLogin picks/My team/admin.svg";
import user from "../../../assets/afterLogin picks/name.png";
import { useRef } from "react";
import mail from "../../../assets/afterLogin picks/mail.png";
import phone from "../../../assets/afterLogin picks/My team/phone.svg";
import { BaseUrl } from "../../../reducers/Api/bassUrl";
import axios from "axios";
import { useSelector } from "react-redux";
import { useState } from "react";
import Alerts from "../../Alerts";
import { ToastContainer, toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { fetchTeamDetails } from "../../../reducers/teamSlice";





const AddTeamMember = ({team, handleCloseAddMember}) => {
    const logoInputRef = useRef(null);
    const token = useSelector(state => state.auth.user.data.user.token);
    const [isAdminSelected, setIsAdminSelected] = useState(false);
    const [formData, setFormData] = useState({
        image: "",
        fullName: '',
        mobile: "",
        email: "",
        teamId: team._id,
        isAdmin: false
    });


    const [selectedImage, setSelectedImage] = useState(null);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');
    const dispatch = useDispatch();


    const handleAdminToggle = () => {
        setIsAdminSelected(!isAdminSelected);
        setFormData((prevFormData) => ({
            ...prevFormData,
            isAdmin: !isAdminSelected
        }))
    }



    const handleLogoSelect = () => {
        logoInputRef.current.click();
    }
    const handleLogo = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
            };
            reader.readAsDataURL(file);
            setFormData((prevFormData) => ({
                ...prevFormData,
                image: file
            }));
        }
    }


    // add Member 
    const addMember = async (e) => {
        e.preventDefault();
    
        // Validation: Check if all required fields are filled
        if ( !formData.fullName || !formData.mobile || !formData.email) {
            setAlertMessage('All fields are required.');
            setAlertType('error');
            return;
        }
    
        const addMemberUrl = BaseUrl();
        const formDataToSend = new FormData();
        Object.keys(formData).forEach(key => formDataToSend.append(key, formData[key]));
    
        try {
            const response = await axios.post(
                `${addMemberUrl}/api/v1/user/team/add-member`,
                formDataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
    
            if (response.data.status === 200) {
                const successMessage = response.data.message;
               
                console.log(response.data);
                toast(successMessage)
                dispatch(fetchTeamDetails({ teamId: team._id, token}))
                handleCloseAddMember();
            } else {
                const errorMessage = response.data.errors ? response.data.errors.msg : 'Error adding member';
                setAlertMessage(errorMessage);
                setAlertType('error');
                console.log(response.data);
                toast(errorMessage)
            }
        } catch (error) {
            console.error("Error adding member:", error);
            setAlertMessage('Internal server error');
            setAlertType('error');
        }
    };
    



    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    return (
        <div className="container-fluid Add-member">

            <div className=" ">

                <div className="d-flex  justify-content-center mt-2 ">

                    <div className="upload-icon-div" onClick={handleLogoSelect}>
                        {selectedImage ? (
                            <img src={selectedImage} alt="Selected" className="selected-image"
                                style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "10px" }} />
                        ) : (
                            <img src={uploadIcon} alt="upload icon" />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            ref={logoInputRef}
                            style={{ display: "none" }}
                            onChange={handleLogo}
                        />
                    </div>

                </div>

                <ToastContainer />

                <form className="form " onSubmit={addMember}>
                    <div className="position-relative">
                        <label htmlFor="teamName">Full Name</label>
                        <div className="input-with-icon mt-3">
                            <input
                                type="text"
                                placeholder="Enter your Name "
                                className="py-2 rounded form-control"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                            />
                            <img src={user} alt="team name" className="input-icon " />
                        </div>
                    </div>


                    <div className="position-relative">
                        <label htmlFor="teamName">Email address</label>
                        <div className="input-with-icon mt-3">
                            <input
                                type="text"
                                placeholder="Enter email address "
                                className="py-2 rounded form-control"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                            <img src={mail} alt="team name" className="input-icon " />
                        </div>
                    </div>

                    <div className="position-relative">
                        <label htmlFor="teamName">Mobile number</label>
                        <div className="input-with-icon mt-3">
                            <input
                                type="text"
                                placeholder="Enter  mobile number "
                                className="py-2 rounded  form-control"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleInputChange}
                            />
                            <img src={phone} alt="team name" className="input-icon " />
                        </div>
                    </div>


                    <div className="admin d-flex align-items-center mt-2 ">
                        <button type="button" onClick={handleAdminToggle} className="btn ps-0 ">
                            <img src={isAdminSelected ? admin_selected : admin} alt="admin"
                                style={{
                                    width: "35px",
                                    height: "35px",
                                    
                                }}
                            />
                        </button>

                        <div>
                            <p className=" pt-2">Mark as admin</p>
                        </div>
                    </div>



                    {alertMessage && <Alerts type={alertType} message={alertMessage} />}

                    <div className="addMember-btn d-flex justify-content-center mb-xxl-3 mb-3">
                    <button
                        type="submit"
                        className="btn btn-danger"
                        disabled={ !formData.fullName || !formData.mobile || !formData.email}
                    >
                        Send Invite
                    </button>
                </div>

                </form>

            </div>
        </div>
    );
};

export default AddTeamMember;
