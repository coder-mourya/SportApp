import React, { useRef, useState } from "react";
import upload from "../../../assets/afterLogin picks/My team/upload.svg";
import uploadIcon from "../../../assets/afterLogin picks/My team/upload-icon.svg";
import user from "../../../assets/afterLogin picks/name.png";
// import ImageCropper from "../../Utils/ImageCropper";
import { BaseUrl } from "../../../reducers/Api/bassUrl";
import axios from "axios";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";



const EditTeam = ({ team, handleCloseEditTeam }) => {
    const [formData, setFormData] = useState({
        teamId: "",
        teamName: "",
        tagLine: "",
        country: "",
        state: "",
        city: "",
        teamColour_id: "",
        description: "",
        coverPhoto: null,
        logo: null
    });
    const fileInputRef = useRef(null);
    const logoInputRef = useRef(null);
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [logo, setLogo] = useState(null);
    // const [croppedImage, setCroppedImage] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [countryList, setCountryList] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [colors, setColors] = useState([])
    const token = useSelector(state => state.auth.user.data.user.token);
    const Navigate = useNavigate();

    // console.log("chosen sports", chosenSports);

    console.log("team data in edit team", team);

    useEffect(() => {
        if (team) {

            setFormData((prevFormData) => ({

                ...prevFormData,
                teamName: team.teamName || "",
                tagLine: team.tagLine || "",
                country: team.country || "",
                state: team.state || "",
                city: team.city || "",
                teamColour_id: team.teamColour_id || "",
                sport: team.sport.sports_name || "",
                coverPhoto: team.coverPhoto || prevFormData.coverPhoto,
                logo: team.logo || prevFormData.logo,

            }));

            setLogo(team.logo || null)
            setCoverPhoto(team.coverPhoto || null)
        }
    }, [team]);


    const handleEditTeam = async () => {
        const editTeamUrl = BaseUrl();
        const teamId = team._id;

        const formDataToSend = new FormData();
        let isUpdate = false;

        if (team.teamName !== formData.teamName) {
            isUpdate = true;
            formDataToSend.append("teamName", formData.teamName);
        }

        if (team.tagLine !== formData.tagLine) {
            isUpdate = true;
            formDataToSend.append("tagLine", formData.tagLine);
        }
        if (team.country !== formData.country) {
            isUpdate = true;
            formDataToSend.append("country", formData.country);
        }
        if (team.state !== formData.state) {
            isUpdate = true;
            formDataToSend.append("state", formData.state);
        }
        if (team.city !== formData.city) {
            isUpdate = true;
            formDataToSend.append("city", formData.city);
        }
        if (team.teamColour_id !== formData.teamColour_id) {
            isUpdate = true;
            formDataToSend.append("teamColour_id", formData.teamColour_id);
        }
        if (team.coverPhoto !== formData.coverPhoto) {
            isUpdate = true;
            formDataToSend.append("coverPhoto", formData.coverPhoto);
        }
        if (team.logo !== formData.logo) {
            isUpdate = true;
            formDataToSend.append("logo", formData.logo);
        }

        console.log("form data to send", ...formDataToSend);
        
        

        if (isUpdate) {
            try {
                const response = await axios.put(`${editTeamUrl}/user/team/edit/${teamId}`, formDataToSend, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });

                if (response.data.status === 200) {
                    toast.success(response.data.message);
                    handleCloseEditTeam();
                    Navigate("/CreateTeam")
                } else {
                    toast.error(response.data.errors.msg);
                    // console.log("Error updating team:", response.data.errors);
                }
            } catch (error) {
                console.error("Internal server error", error);
            }
        }
    };




    const handleFileSelect = () => {
        fileInputRef.current.click();
    };


    // handle cover photo upload
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setCoverPhoto(URL.createObjectURL(file));
        setFormData(prevFormData => ({ ...prevFormData, coverPhoto: file }));
    };

    // handle logo upload
    const handleLogoSelect = () => {
        logoInputRef.current.click();
    }
    const handleLogo = (event) => {
        const file = event.target.files[0];
        setLogo(URL.createObjectURL(file));
        setFormData(prevFormData => ({ ...prevFormData, logo: file }));
    };



    // const handleCropComplete = (croppedImage) => {
    //     setCroppedImage(croppedImage);

    //     // onFormDataChange({ croppedCoverPhoto: croppedImage });
    // };




    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "country") {
            const selectCountry = e.target.options[e.target.selectedIndex].getAttribute("data-country-id");
            setFormData(prevData => ({ ...prevData, country: value }));  // Update country in formData
            getState(selectCountry);
        } else if (name === "state") {
            const selectState = e.target.options[e.target.selectedIndex].getAttribute("data-state-id");
            setFormData(prevData => ({ ...prevData, state: value }));  // Update state in formData
            getCity(selectState);
        } else if (name === "city") {
            setFormData(prevData => ({ ...prevData, city: value }));  // Update city in formData
        } else {
            setFormData(prevData => ({ ...prevData, [name]: value }));
        }
    };





    useEffect(() => {

        getCountry();
        getColors()

    }, [])

    const getCountry = async () => {

        const countoryUrl = BaseUrl()

        try {
            const response = await axios.get(`${countoryUrl}/auth/country_list`)



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
            const response = await axios.get(`${stateUrl}/auth/state_list/${countryId}`);

            setStates(response.data.data.state_list);
            // console.log(response.data);
        } catch (error) {
            console.log("Error fetching state list:", error);
        }
    };



    const getCity = async (stateId) => {
        const citiUrl = BaseUrl();

        try {
            const response = await axios.get(`${citiUrl}/auth/city_list/${stateId}`)
            setCities(response.data.data.city_list);
            // console.log(response.data);
        } catch (error) {
            console.log("error detching cities :", error);
        }

    }




    // get colors
    const getColors = async () => {
        const colorUrl = BaseUrl();
        try {
            const response = await axios.get(`${colorUrl}/user/teams/colours/list`);
            setColors(response.data.data.colours_list);
            console.log(response.data);
        } catch (error) {
            console.log("Error fetching colors:", error);
        }
    }


    const handleColorChange = (colorId) => {
        // console.log(colorId);
        setFormData(prevData => ({
            ...prevData,
            teamColour_id: colorId
        }));
        setSelectedColor(colorId);
    };





    return (
        <div className="container-fluid edit-team-component">
            <div className="cover-photo rounded position-relative">



                {/* Render the selected image */}
                <img src={coverPhoto} alt="cropped cover" className="img-fluid" style={{
                    objectFit: "cover",
                    borderRadius: "10px",
                    width: "100%",
                    height: "10rem"
                }} />

                {/* Display "Change cover photo" text and trigger file input */}
                <div
                    className="upload-overlay position-absolute bottom-0 end-0 p-3 d-flex align-items-center"
                    onClick={handleFileSelect}
                >
                    <img src={upload} alt="upload" />
                    <p className="mb-0 ms-2">Change cover photo</p>
                </div>

                {/* Hidden file input */}
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                />



                <div className="upload-icon-container" onClick={handleLogoSelect}>

                    <div className="logo-icon">
                        {logo ? (
                            <img src={logo} alt="logo" className="img-fluid border-4" />
                        ) : (
                            <img src={uploadIcon} alt="upload icon" />
                        )}
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        ref={logoInputRef}
                        style={{ display: "none" }}
                        onChange={handleLogo}
                    />
                </div>
            </div>



            <div className="team-details mt-5">
                <form>
                    <div className="row">
                        <div className="col-md-6 position-relative">
                            <label htmlFor="teamName">Team Name</label>
                            <div className="input-with-icon mt-2">
                                <input
                                    type="text"
                                    placeholder="Enter here"
                                    className="py-2 rounded"
                                    id="teamName"
                                    name="teamName"
                                    value={formData.teamName}
                                    onChange={handleInputChange}
                                    required
                                />
                                <img src={user} alt="team name" className="input-icon" />
                            </div>
                        </div>
                        <div className="col-md-6 position-relative">
                            <label htmlFor="teamName">Tagline (optional)</label>
                            <div className="input-with-icon mt-2">
                                <input
                                    type="text"
                                    placeholder="Enter your tagline"
                                    className="py-2 rounded"
                                    onChange={handleInputChange}
                                    name="tagline"
                                    value={formData.tagline}

                                />
                                <img src={user} alt="tagline" className="input-icon" />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 ">
                            <div className=" mt-4">
                                <input type="text"
                                    placeholder="Enter your tagline"
                                    className="py-2 rounded form-control"
                                    name="sport"
                                    value={formData.sport}
                                    onChange={handleInputChange}
                                    disabled={true}
                                />
                            </div>
                        </div>
                        <div className="col-md-6 ">
                            <div className=" mt-4">
                                <select
                                    id="country"
                                    name="country"
                                    className="form-select py-2 rounded"
                                    onChange={handleInputChange}
                                    value={formData.country}
                                    required

                                >
                                    <option value="">--Select Country--</option>
                                    {countryList.map((country, index) => (
                                        <option key={index} value={country.code}
                                            data-country-id={country.id}

                                        >
                                            {country.name}

                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 ">
                            <div className=" mt-3">
                                <select id="state" name="state" className="form-select py-2 rounded" onChange={handleInputChange} value={formData.state}>
                                    <option value="">--Select State--</option>
                                    {states.map((state) => (
                                        <option key={state._id} value={state.name} data-state-id={state.id}>{state.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="col-md-6 ">
                            <div className=" mt-3">
                                <select id="city" name="city" className="form-select py-2 rounded" onChange={handleInputChange} value={formData.city}>
                                    <option value="">--Select city--</option>
                                    {cities.map((city, index) => (
                                        <option key={index} value={city.name} data-country-id={city.id}>{city.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="mt-2">
                    <p>Choose team color</p>

                    <div className="color-picker-container">
                        {colors.map((color, index) => (
                            <button
                                key={index}
                                className="color-button"
                                value={color._id}
                                style={{
                                    backgroundColor: color.colour,
                                    borderColor: color.border_colour,
                                    position: 'relative',
                                }}
                                onClick={() => handleColorChange(color._id)}
                            >

                                {selectedColor === color._id && (
                                    <span
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            color: color.border_colour,
                                            fontWeight: 'bold',
                                            zIndex: 1,
                                        }}
                                    >
                                        ✓
                                    </span>
                                )}

                            </button>
                        ))}

                        {/* Render ImageCropper if cover photo is selected
                        {coverPhoto && !croppedImage && (
                            <ImageCropper
                                imageSrc={coverPhoto}
                                onCropComplete={handleCropComplete}
                            />
                        )} */}


                    </div>
                </div>
            </div>

            <div className="mt-3">
                <button className="btn btn-danger" onClick={handleEditTeam} >Save</button>
            </div>



        </div>
    );
};

export default EditTeam;
