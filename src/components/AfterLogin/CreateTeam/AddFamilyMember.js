import React from "react";
// import { useNavigate } from "react-router-dom";
import "../../../assets/Styles/AfterLogin/Addmember.css";
import uploadIcon from "../../../assets/afterLogin picks/My team/upload-icon.svg";
import user from "../../../assets/afterLogin picks/name.png";
import { useRef } from "react";
import { BaseUrl } from "../../../reducers/Api/bassUrl";
import axios from "axios";
import { useSelector } from "react-redux";
import { useState } from "react";
import Alerts from "../../Alerts";
import dob from "../../../assets/afterLogin picks/dob.png";

// import { useDispatch } from "react-redux";





const AddFamilyMember = () => {
    const logoInputRef = useRef(null);
    const token = useSelector(state => state.auth.user.data.user.token);

    const [formData, setFormData] = useState({
        image: "",
        fullName: '',
        dob: "",
        gender: "",
        relationWithCreator: ""

    });

    const [selectedImage, setSelectedImage] = useState(null);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');




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
        const addMemberUrl = BaseUrl();

        try {
            const response = await axios.post(
                `${addMemberUrl}/api/v1/user/add-family-member`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )

            if (response.data.status === 200) {
                setAlertMessage('Member added successfully');
                setAlertType('success');

                console.log(response.data)
            } else {
                const errorMessage = response.data.errors ? response.data.errors.msg : 'error adding member';
                setAlertMessage(errorMessage);
                setAlertType('error');
                console.log(response.data)
            }
        } catch (error) {
            console.error("Error adding member:", error);
            setAlertMessage('internal server error');
            setAlertType('error');
        }
    }



    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: name === "gender" ? value.toLowerCase() : value,
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

                    <div className=" mt-3">
                        <label htmlFor="formSelect">Gender</label>
                        <select className="form-select py-2 rounded" id="gender" name="gender" value={formData.gender} onChange={handleInputChange}>
                            <option>Select gender</option>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </select>


                    </div>

                    <div className="position-relative">
                        <label htmlFor="teamName">Date of Birth</label>
                        <div className="input-with-icon mt-3">
                            <input
                                type="text"
                                placeholder="Enter date of birth "
                                className="py-2 rounded form-control"
                                name="dob"
                                value={formData.dob}
                                onChange={handleInputChange}
                            />
                            <img src={dob} alt="team name" className="input-icon " />
                        </div>
                    </div>

                    <div className="position-relative">
                        <label htmlFor="relationWithCreator">Relation</label>
                        <div className="input-with-icon mt-3">
                            <select
                                className="py-2 rounded form-control"
                                name="relationWithCreator"
                                value={formData.relationWithCreator}
                                onChange={handleInputChange}
                            >
                                <option value="">Select Relation</option>
                                <option value="Brother">Brother</option>
                                <option value="Sister">Sister</option>
                                <option value="Daughter">Daughter</option>
                                <option value="Father">Father</option>
                                <option value="Mother">Mother</option>
                                <option value="Son">Son</option>
                                <option value="Wife">Wife</option>

                            </select>
                        </div>
                    </div>


                    {alertMessage && <Alerts type={alertType} message={alertMessage} />}

                    <div className="addMember-btn  d-flex justify-content-center  mb-xxl-3 mb-3">
                        <button type="submit" className="btn btn-danger ">Save</button>
                    </div>

                </form>

            </div>
        </div>
    );
};

export default AddFamilyMember;