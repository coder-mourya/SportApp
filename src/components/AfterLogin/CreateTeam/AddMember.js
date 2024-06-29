import React from "react";
// import { useNavigate } from "react-router-dom";
import "../../../assets/Styles/AfterLogin/Addmember.css";
import uploadIcon from "../../../assets/afterLogin picks/My team/upload-icon.svg";
import user from "../../../assets/afterLogin picks/name.png";
import { useRef } from "react";
import mail from "../../../assets/afterLogin picks/mail.png";
import phone from "../../../assets/afterLogin picks/My team/phone.svg";
import { BaseUrl } from "../../../reducers/Api/bassUrl";
import axios from "axios";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { fetchMembers } from "../../../reducers/memberSlice";
import { ToastContainer, toast } from "react-toastify";




const AddMember = ({handleCloseAddMember}) => {
    const logoInputRef = useRef(null);
    const token = useSelector(state => state.auth.user.data.user.token);

    const [formData, setFormData] = useState({
        image: "",
        fullName: '',
        mobile: "",
        email: "",
        sportId: "",
        isAdmin: false
    });
    const chosenSports = useSelector(state => state.auth.user.data.user.chosenSports);

    const [selectedImage, setSelectedImage] = useState(null);


    const dispatch = useDispatch()



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
                `${addMemberUrl}/api/v1/user/add-member`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )

            if (response.data.status === 200) {
                dispatch(fetchMembers(token))
                const message = response.data.message
                toast.success(message)
                handleCloseAddMember()
                // console.log(response.data)
            } else {
                const errorMessage = response.data.errors ? response.data.errors.msg : 'error adding member';
                toast.error(errorMessage)
            }
        } catch (error) {
            // console.error("Error adding member:", error);
            toast.error("internal server error");
        }
    }



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
                <ToastContainer />
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
                        <label htmlFor="formSelect">Sport type</label>
                        <select id="option1"
                            name="sportId"
                            className="form-select py-2 rounded form-select"
                            onChange={handleInputChange}
                            value={formData.sportId}

                        >
                            <option >--Select sport type--</option>
                            {chosenSports.map((sport, index) => (
                                <option key={index} value={sport._id} >
                                    {sport.sports_name}
                                </option>
                            ))}
                        </select>


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


                    <div className="addMember-btn  d-flex justify-content-center  mb-xxl-3 mb-3">
                        <button type="submit" className="btn btn-danger ">Save</button>
                    </div>

                </form>

            </div>
        </div>
    );
};

export default AddMember;
