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
import dob from "../../../assets/afterLogin picks/dob.png";
import DatePicker from "react-datepicker";
import { toast, ToastContainer } from "react-toastify";
// import { useDispatch } from "react-redux";





const AddFamilyMember = ({handleCloseAddFamilyMember}) => {
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

        const formatedDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;

        }

        const formatedData = {
            ...formData,
            dob: formatedDate(formData.dob),
            gender: formData.gender.toLowerCase()
        }
        // console.log("form data ", formatedData);


        try {
            const response = await axios.post(
                `${addMemberUrl}/api/v1/user/add-family-member`,
                formatedData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )

            if (response.data.status === 200) {
                toast.success('Member added successfully');
                handleCloseAddFamilyMember();
                window.location.reload();
                // console.log(response.data)
            } else {
                const errorMessage = response.data.errors ? response.data.errors.msg : 'error adding member';
                toast.error(errorMessage);
                // console.log(response.data)
            }
        } catch (error) {
            console.error("Error adding member:", error);
            toast.error("internal server error");
        }
    }



    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const handleDateChange = (date) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            dob: date,
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
                        <div className="input-with-icon mt-2">
                            <input
                                type="text"
                                placeholder="Enter your Name "
                                className="py-2 rounded form-control"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                required
                            />
                            <img src={user} alt="team name" className="input-icon " />
                        </div>
                    </div>

                    <div className="my-3">
                        <label htmlFor="formSelect">Gender</label>
                        <select className="form-select py-2 mt-2 rounded"
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            required
                            >
                            <option value="">Select gender</option>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </select>


                    </div>

                    <div className="mb-3">
                        <label htmlFor="dob" className="form-label">Date of Birth</label>

                        <div className="input-group mt-1"
                        >
                            <span className="input-group-text "
                                style={{ height: "42px" }}
                            >
                                <img src={dob} alt="password" />
                            </span>
                            <DatePicker
                                type="date"
                                selected={formData.dob}
                                onChange={handleDateChange}
                                dateFormat="yyyy-MM-dd"
                                className={`form-control py-2 mt-0`}
                                id="dateOfBirth"
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                placeholderText="Select your date of birth"
                                required
                            />


                        </div>
                    </div>


                    <div className="position-relative">
                        <label htmlFor="relationWithCreator">Relation</label>
                        <div className="input-with-icon mt-2">
                            <select
                                className="py-2 rounded form-control"
                                name="relationWithCreator"
                                value={formData.relationWithCreator}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="" disabled selected>Select Relation</option>
                                <option >Brother</option>
                                <option >Sister</option>
                                <option >Daughter</option>
                                <option >Father</option>
                                <option >Mother</option>
                                <option >Son</option>
                                <option >Wife</option>

                            </select>
                        </div>
                    </div>
                    <ToastContainer />

                    <div className="addMember-btn  d-flex justify-content-center  mb-xxl-3 mb-3">
                        <button type="submit" className="btn btn-danger ">Save</button>
                    </div>

                </form>

            </div>
        </div>
    );
};

export default AddFamilyMember;
