import React, { useRef, useState, useEffect } from "react";
import addPhotoIcon from "../../../assets/afterLogin picks/My team/upload-icon.svg";
import { BaseUrl } from "../../../reducers/Api/bassUrl";
import axios from "axios";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { fetchTeamDetails } from "../../../reducers/teamSlice";
import { useDispatch } from "react-redux";


const EditMember = ({ teamId, selectedMember, handleCloseEditMember }) => {
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        profileImage: null,
        description: "",
        expectations: "",
        jerseySize: "",
        pantSize: "",
        nameOnJersey: "",
        numberOnJersey: "",
    });
    const [profileImage, setProfileImage] = useState([]);
    const token = useSelector(state => state.auth.user.data.user.token);
    const currentUser = useSelector(state => state.auth.user.data.user);

    const jerseySizes = ["YMD-10", "YLG 14 - 16", "YXL 18-20", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL", "6XL", "7XL", "8XL", "9XL", "10XL"];
    const trouserSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL", "28", "30", "32", "34", "36", "38", "40", "42", "44", "YMD-10", "YLG 14 - 16", "YXL 18-20"];

    console.log("selected member data in edit member", selectedMember);
    // console.log("team id in edit member", teamId);
    useEffect(() => {
        if (selectedMember) {
            setFormData(prevFormData => ({
                ...prevFormData,
                description: selectedMember.description || "",
                expectations: selectedMember.expectations || "",
                jerseySize: selectedMember.jerseyDetails.shirt_size || "",
                pantSize: selectedMember.jerseyDetails.pant_size || "",
                nameOnJersey: selectedMember.jerseyDetails.name || "",
                numberOnJersey: selectedMember.jerseyDetails.number || "",
            }));
            
            if(selectedMember.profileImage){
                setProfileImage(selectedMember.profileImage);
            }
            // console.log("profile image", selectedMember.profileImage);
        }
    }, [selectedMember]);

    const dispatch = useDispatch();
    const handleFileSelect = () => {
        fileInputRef.current.click();
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setProfileImage(URL.createObjectURL(file));
        setFormData(prevData => ({ ...prevData, profileImage: file }));
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const isDisabled = !(selectedMember && currentUser._id === selectedMember.memberId);

    const handleSubmit = async (event) => {
        event.preventDefault();



        // Check if currentUser matches the memberId of selectedMember

        const formDataToSend = new FormData();
        formDataToSend.append('profileImage', formData.profileImage);
        formDataToSend.append('description', formData.description);
        // formDataToSend.append('jerseySize', formData.jerseySize);
        // formDataToSend.append('pantSize', formData.pantSize);
        // formDataToSend.append('nameOnJersey', formData.nameOnJersey);
        // formDataToSend.append('numberOnJersey', formData.numberOnJersey);
        formDataToSend.append('expectations', formData.expectations);
        formDataToSend.append('teamId', teamId);

        const jerseyDetails = {
            shirt_size: formData.jerseySize,
            pant_size: formData.pantSize,
            name: formData.nameOnJersey,
            number: formData.numberOnJersey
        };

        formDataToSend.append('jerseyDetails', JSON.stringify(jerseyDetails));

        const updateAboutMeUrl = BaseUrl();

        console.log("formDataToSend", ...formDataToSend);


        try {
            const response = await axios.put(`${updateAboutMeUrl}/user/update/aboutMe`, formDataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.status === 200) {
                const message = response.data.message;
                console.log("Profile updated successfully", response.data);
                toast.success(message);
                // console.log("check team id and token", teamId, "token ", token);
                dispatch(fetchTeamDetails({teamId : teamId, token : token}));
                handleCloseEditMember();
            } else {
                const errorMessage = response.data.errors ? response.data.errors.msg : "Error updating profile";
                toast.error(errorMessage);
                console.log("Error updating profile", response.data);
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
                        {!isDisabled && (
                            <p className="ms-4" onClick={handleFileSelect} style={{ cursor: 'pointer' }}>Change Profile</p>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleFileUpload}

                            disabled={isDisabled}
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
                            disabled={isDisabled}



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
                        disabled={isDisabled}



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
                                disabled={isDisabled}


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
                                disabled={isDisabled}


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
                                disabled={isDisabled}


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
                                disabled={isDisabled}


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
                        disabled={isDisabled}

                    />
                </div>

                <div className="aboutme-buttons mt-3">
                    {!isDisabled && (
                        <button
                            className="btn  ms-2"
                            type="submit"
                            style={{ width: "100%", backgroundColor: "#DB3525", color: "white" }}



                        >
                            Save changes
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default EditMember;
