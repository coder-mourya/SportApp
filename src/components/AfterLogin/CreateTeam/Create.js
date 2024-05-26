import React, { useState } from "react";
import TeamForm from "./TeamForm";
import AboutMe from "./AboutMe";
import cros from "../../../assets/afterLogin picks/My team/Cross.svg";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { BaseUrl } from "../../../reducers/Api/bassUrl";

const Create = () => {
    const [selectedStep, setSelectedStep] = useState(1); // State to track the selected step
    const [formData, setFormData] = useState({
        teamDetails: {
            teamName: "",
            tagLine: "",
            sports_id: "",
            country: "",
            state: "",
            city: "",
            teamColour_id: "",
            coverPhoto: null,
            logo: null
        },

        aboutMe: {
            creatorImage: null,
            aboutCreator: "",
            jerseySize: "",
            nameOnJersey: "",
            pantSize: "",
            numberOnJersey: "",
            expectations: "",
            creatorIsAdmin : false,
        }

    });

    
    const token = useSelector(state => state.auth.user.data.user.token);


    const Navigate = useNavigate();

    // Function to handle step selection
    const handleStepSelect = (step) => {
        setSelectedStep(step);
    };

    // Function to navigate to the next step
    const handleNext = () => {
        setSelectedStep(2); // Navigate to step 2 (AboutMe component)
    };

    // Function to navigate back to the main page
    const handleCros = () => {
        Navigate("/CreateTeam");
    };

    // function to handle form data
    const handleFormDataChange = (section, data) => {
        setFormData((prevData) => ({
            ...prevData,
            [section]: {
                ...prevData[section],
                ...data
            }
        }));
    }

    // handle form sumbission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const combinedFormData = {
            ...formData.teamDetails,
            ...formData.aboutMe
        };

        console.log("form submiton function called ", combinedFormData);

        const submitUrl = BaseUrl();
    
        try {
            const response = await axios.post(`${submitUrl}/api/v1/user/create/team`, combinedFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (response.status === 200) {
                console.log(response.data);
            } else {
                console.log("error in creating team", response.data);
            }
    
        } catch (error) {
            console.error(error);
        }
    }
    
    return (
        <div className="container-fluid create">
            <div className="background"></div>
            <div className="half-container p-4">
                <div className="d-flex justify-content-between align-items-center">
                    <h2>Create Team</h2>
                    <img src={cros} alt="cross button" className="cross-button" onClick={handleCros} />
                </div>
                <div className="d-flex justify-content-between mt-4 details-options">
                    <div className="text-center">
                        <button
                            className={`btn  ${selectedStep === 1 ? "selected" : ""}`}
                            onClick={() => handleStepSelect(1)}
                        >
                            1
                        </button>
                        <p>Team details</p>
                    </div>
                    <p className="mt-1 line d-none d-sm-block">---------------------------------------------------------------</p>
                    <p className="mt-1 line d-sm-none">----------------------</p>
                    <div className="text-center">
                        <button
                            className={`btn  ${selectedStep === 2 ? "selected" : ""}`}
                            onClick={() => handleStepSelect(2)}
                        >
                            2
                        </button>
                        <p>About me</p>
                    </div>
                </div>
                {/* Render the selected component */}
                {selectedStep === 1 ? (
                    <TeamForm
                        formData={formData.teamDetails}
                        onFormDataChange={(data) => handleFormDataChange('teamDetails', data)}
                        onNext={handleNext}
                    />
                ) : (
                    <AboutMe
                        formData={formData.aboutMe}
                        onFormDataChange={(data) => handleFormDataChange('aboutMe', data)}
                        onSubmit={handleSubmit}
                    />
                )}
            </div>
        </div>
    );
};

export default Create;
