import React, { useRef, useState } from "react";
import addPhotoIcon from "../../../assets/afterLogin picks/My team/upload-icon.svg";
import { BaseUrl } from "../../../reducers/Api/bassUrl";
import axios from "axios";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { fetchTeamDetails } from "../../../reducers/teamSlice";
import { useDispatch } from "react-redux";


const AddAboutMe = ({teamId, handleCloseAboutMe}) => {
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        profileImage: null,
        description: "",
        expectations: ""
    });
    const [profileImage, setprofileImage] = useState("");
    const token = useSelector(state => state.auth.user.data.user.token);
    const dispatch = useDispatch();
   
    console.log("team data in about me ", teamId );

    const jerseySizes = [
        "YMD-10",
        "YLG 14 - 16",
        "YXL 18-20",
        "XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL", "6XL", "7XL", "8XL", "9XL", "10XL"
    ];

    const trouserSizes = [
        "XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL", "28", "30", "32", "34", "36", "38", "40", "42", "44", "YMD-10", "YLG 14 - 16", "YXL 18-20"
    ];

    const handleFileSelect = () => {
        fileInputRef.current.click();
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setprofileImage(URL.createObjectURL(file));
        setFormData(prevData => ({ ...prevData, profileImage: file }));
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

   

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const formDataToSend = new FormData();
        formDataToSend.append('profileImage', formData.profileImage);
        formDataToSend.append('creatorName', formData.creatorName);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('jerseySize', formData.jerseySize);
        formDataToSend.append('pantSize', formData.pantSize);
        formDataToSend.append('nameOnJersey', formData.nameOnJersey);
        formDataToSend.append('numberOnJersey', formData.numberOnJersey);
        formDataToSend.append('expectations', formData.expectations);
        formDataToSend.append('teamId', teamId);
    
        const jerseyDetails = {
            shirt_size: formData.jerseySize,
            pant_size: formData.pantSize,
            name: formData.nameOnJersey,
            number: formData.numberOnJersey
        };
    
        // Append jerseyDetails as a JSON string
        formDataToSend.append('jerseyDetails', JSON.stringify(jerseyDetails));
    
        const updateAboutMeUrl = BaseUrl();
    
        try {
            const response = await axios.put(`${updateAboutMeUrl}/api/v1/user/update/aboutMe`, formDataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
    
            if (response.status === 200) {
                console.log(response.data);
                const message = response.data.message;
                toast.success(message);
                dispatch(fetchTeamDetails({ teamId, token }));
                handleCloseAboutMe()
            } else {
                const errorMessage = response.data.errors ? response.data.msg : "Error updating profile";
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error("Internal server error", error);
            toast.error("Internal server error");
        }
    };
    

    return (
        <div className="aboutMe">
            <div className="upload-icon d-flex justify-content-start align-items-center">
                {profileImage ? (
                    <div className="d-flex flex-row align-items-center">
                        <img src={profileImage} alt="Profile" className="profile-img" style={{ width: "117px", height: "117px" }} />
                        <p className="ms-4" onClick={handleFileSelect} style={{ cursor: 'pointer' }}>Change Profile</p>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleFileUpload}
                        />
                    </div>
                ) : (
                    <div className="add-photo d-flex justify-content-center align-items-center" onClick={handleFileSelect}>
                        <img src={addPhotoIcon} alt="Add Profile" />
                        <p className="ms-4">Add Profile</p>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleFileUpload}
                        />
                    </div>
                )}
            </div>

            <form className="form aboutme-form" onSubmit={handleSubmit}>

                <ToastContainer />
                <div className="mt-2">
                    <label htmlFor="description">About me</label>
                    <textarea
                        name="description"
                        id="description"
                        cols="30"
                        rows="10"
                        className="form-control"
                        onChange={handleInputChange}
                        value={formData.description}
                        placeholder="Write about your interests, hobbies, Proficiency…..
                    Hi, I am Gaurav, right handed batsman. I Played cricket for different clubs in Pune."
                    />
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <div className="mt-4">
                            <select
                                id="jerseySize"
                                name="jerseySize"
                                className="form-select py-2 rounded"
                                onChange={handleInputChange}
                                value={formData.jerseySize}
                            >
                                <option>--Select Jersey Size--</option>
                                {jerseySizes.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="mt-4">
                            <select
                                id="pantSize"
                                name="pantSize"
                                className="form-select py-2 rounded"
                                onChange={handleInputChange}
                                value={formData.pantSize}
                            >
                                <option>--Select Trouser Size--</option>
                                {trouserSizes.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mt-2">
                        <label htmlFor="nameOnJersey">Jersey Name</label>
                        <div className="input-with-icon">
                            <input
                                type="text"
                                placeholder="ABC"
                                className="py-2 rounded"
                                id="nameOnJersey"
                                name="nameOnJersey"
                                value={formData.nameOnJersey}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <div className="col-md-6 mt-2">
                        <label htmlFor="numberOnJersey">Jersey Number</label>
                        <div className="input-with-icon">
                            <input
                                type="text"
                                placeholder="000"
                                className="py-2 rounded"
                                id="numberOnJersey"
                                name="numberOnJersey"
                                value={formData.numberOnJersey}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-2">
                    <label htmlFor="expectations">Expectations from the team</label>
                    <textarea
                        name="expectations"
                        id="expectations"
                        cols="20"
                        rows="3"
                        className="form-control text-aria2"
                        value={formData.expectations}
                        placeholder="Write what do you expect from the team!"
                        style={{ resize: "none", height: "100px" }}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="aboutme-buttons mt-3">
                   
                    <button 
                    className="btn  ms-2" 
                    type="submit"
                    style={{width:"100%", 
                        backgroundColor: "#DB3525",
                        color: "white",
                    }}
                    
                    >Save</button>
                </div>
            </form>
        </div>
    );
}

export default AddAboutMe;
