import React, { useRef, useState } from "react";
import upload from "../../../assets/afterLogin picks/My team/upload.svg";
import uploadIcon from "../../../assets/afterLogin picks/My team/upload-icon.svg";
import user from "../../../assets/afterLogin picks/name.png";
import ImageCropper from "../../Utils/ImageCropper";
import { BaseUrl } from "../../../reducers/Api/bassUrl";
import axios from "axios";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";


const TeamDetails = ({ onFormDataChange, formData, onNext }) => {
    const fileInputRef = useRef(null);
    const logoInputRef = useRef(null);
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [logo, setLogo] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [hasImage, setHasImage] = useState(false);

    const [countryList, setCountryList] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [colors, setColors] = useState([])
    const [error, setError] = useState({});
    const chosenSports = useSelector(state => state.auth.user.data.user.chosenSports);
    // console.log("chosen sports", chosenSports);

   


    const handleFileSelect = () => {
        fileInputRef.current.click();
    };


    // handle cover photo upload
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
       if(file){
        setCoverPhoto(URL.createObjectURL(file));
        onFormDataChange({ coverPhoto: file });
        setHasImage(true);
        setCroppedImage(null);
       }
    };

    // handle logo upload
    const handleLogoSelect = () => {
        logoInputRef.current.click();
    }

    const handleLogo = (e) => {
        const file2 = e.target.files[0];
    
        if(file2){
            setLogo(URL.createObjectURL(file2))
        onFormDataChange({ logo: file2 });
        }
    }

    const ValidationForm = () => {
        let tempError = {};
        if (!formData.teamName) tempError.teamName = "Team Name is required";
        if (!formData.country) tempError.country = "Country is required";
        if (!formData.teamColour_id) tempError.teamColour_id = "Team Color is required";
        if (!formData.logo) tempError.logo = " Logo is required";
        if (!formData.coverPhoto) tempError.coverPhoto = "Cover Photo is required";
        if(!formData.sports_id) tempError.sports_id = "Sports is required";
        setError(tempError)

        console.log(" validation  error", tempError);
        console.log("form data ", formData);
        return Object.keys(tempError).length === 0;
    }

    const handleNext = () => {
        if(ValidationForm()){
            onNext();
        }else{
            toast.error(`Please fill all the required fields`);
        }        
    };

    const handleCropComplete = (croppedImage) => {
        setCroppedImage(croppedImage);
        setHasImage(true)
        // onFormDataChange({ coverPhoto: croppedImageBlob });
    };




    const handleInputChange = (e) => {
        const { name, value } = e.target;

        onFormDataChange({ [name]: value });


        if (name === "country") {
            const selectCountry = e.target.options[e.target.selectedIndex].getAttribute("data-country-id");
            getState(selectCountry);
        } else if (name === "state") {
            const selectState = e.target.options[e.target.selectedIndex].getAttribute("data-state-id");
            getCity(selectState);
        } else if (name === "sport") {
            const selectedSport = chosenSports.find(sport => sport._id === value);
            // console.log("selected sport: ", selectedSport);
            if (selectedSport) {
                const sportId = selectedSport._id;
                onFormDataChange({ sports_id: sportId });
            }
        } else {
            onFormDataChange({ [name]: value });
        }
    };



    useEffect(() => {

        getCountry();
        getColors()

    }, [])

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
            // console.log(response.data);
        } catch (error) {
            console.log("Error fetching state list:", error);
        }
    };



    const getCity = async (stateId) => {
        const citiUrl = BaseUrl();

        try {
            const response = await axios.get(`${citiUrl}/api/v1/auth/city_list/${stateId}`)
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
            const response = await axios.get(`${colorUrl}/api/v1/user/teams/colours/list`);
            setColors(response.data.data.colours_list);
            // console.log(response.data);
        } catch (error) {
            console.log("Error fetching colors:", error);
        }
    }


    const handleColorChange = (colorId) => {
        onFormDataChange({ teamColour_id: colorId });
        setSelectedColor(colorId);
    };





    return (
        <div className="container-fluid creat-teamForm-container">
            <div className="cover-photo rounded position-relative">

                {/* Render the selected image if available, otherwise render the default upload image */}
                {croppedImage ? (
                    <img
                        src={URL.createObjectURL(croppedImage)}
                        alt="cropped cover"
                        className="img-fluid"
                        style={{
                            objectFit: "cover",
                            borderRadius: "10px",
                            width: "100%",
                            height: "10rem",
                            zIndex: "1"
                        }}
                    />
                ) : coverPhoto ? (
                    <img
                        src={coverPhoto}
                        alt="cover"
                        className="img-fluid"
                        style={{
                            display: "none"
                        }}
                    />
                ) : (
                    <div style={{
                        width: "100%",
                        height: "10rem",
                        backgroundColor: "#FBE9E9",
                        borderRadius: "10px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        
                        {error.coverPhoto && <p className="text-danger">{error.coverPhoto}</p>}
                    </div>
                )}


                <div
                    className="upload-overlay position-absolute bottom-0 end-0 p-3 d-flex align-items-center"
                    onClick={handleFileSelect}
                >
                    <img src={upload} alt="upload" />
                    <p className="mb-0 ms-2">{hasImage ? "Change cover photo" : "Add cover photo"}</p>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileUpload}
                        required
                    />
                </div>

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


                {error.teamLogo && <p className="text-danger text-center">{error.teamLogo}</p>}

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
                            {error.teamName && <p className="text-danger">{error.teamName}</p>}

                        </div>
                        <div className="col-md-6 position-relative">
                            <label htmlFor="teamName">Tagline (optional)</label>
                            <div className="input-with-icon mt-2">
                                <input
                                    type="text"
                                    placeholder="Enter your tagline"
                                    className="py-2 rounded"
                                    onChange={handleInputChange}

                                />
                                <img src={user} alt="tagline" className="input-icon" />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 ">
                            <div className=" mt-3">
                                <select id="sport" name="sport" className="form-select py-2 rounded"
                                    onChange={handleInputChange}
                                    value={formData.sports_id}
                                    required

                                >
                                    <option value="">--Select sport type--</option>
                                    {chosenSports.map((sport, index) => (
                                        <option key={index} value={sport._id} >
                                            {sport.sports_name}
                                        </option>
                                    ))}
                                </select>
                                {error.sports_id && <p className="text-danger">{error.sports_id}</p>}
                            </div>
                        </div>
                        <div className="col-md-6 ">
                            <div className="mt-3">
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
                                {error.country && <p className="text-danger">{error.country}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 ">
                            <div className=" mt-3">
                                <select id="state" name="state" className="form-select py-2 rounded" onChange={handleInputChange} value={formData.state} required>
                                    <option value="">--Select State--</option>
                                    {states.map((state) => (
                                        <option key={state.name} value={state.name} data-state-id={state.id}>{state.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="col-md-6 ">
                            <div className=" mt-3">
                                <select id="city" name="city" className="form-select py-2 rounded" onChange={handleInputChange} value={formData.city} required>
                                    <option value="">--Select city--</option>
                                    {cities.map((city, index) => (
                                        <option key={index} value={city.name} data-country-id={city.name}>{city.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="mt-2">
                    <p>Choose team color</p>

                        {error.teamColour_id && <p className="text-danger">{error.teamColour_id}</p>}
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
                        {/* Render ImageCropper if cover photo is selected */}
                        {coverPhoto && !croppedImage && (
                            <ImageCropper
                                imageSrc={coverPhoto}
                                onCropComplete={handleCropComplete}
                            />
                        )}

                    </div>

                </div>
            </div>

            <div className="mt-3">
                <button className="btn btn-danger" onClick={handleNext}>Next</button>
            </div>


        </div>
    );
};

export default TeamDetails;
