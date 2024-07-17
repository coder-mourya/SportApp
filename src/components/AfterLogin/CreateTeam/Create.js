import React, { useState } from "react";
import TeamForm from "./TeamForm";
import AboutMe from "./AboutMe";
import { useSelector } from "react-redux";
import axios from "axios";
import { BaseUrl } from "../../../reducers/Api/bassUrl";
import { ToastContainer, toast } from "react-toastify";
import { fetchTeams } from "../../../reducers/teamSlice";
import { useDispatch } from "react-redux";

const Create = ({ handleCloseCreateTeam , ValidationForm}) => {
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
            logo: null,

        },

        aboutMe: {
            creatorImage: null,
            aboutCreator: "",
            jerseySize: "",
            nameOnJersey: "",
            pantSize: "",
            numberOnJersey: "",
            expectations: "",
            creatorIsAdmin: true,
        }

    });

    const token = useSelector(state => state.auth.user.data.user.token);
    const dispatch = useDispatch();


    // Function to handle step selection
    const handleStepSelect = (step) => {
        setSelectedStep(step);
    };


   
    // Function to navigate to the next step
    const handleNext = () => {
            setSelectedStep(2);
    };

    const handlePrev = () => {
        setSelectedStep(1);
    }



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

        // console.log("form submiton function called ", combinedFormData);

        // return;

        const submitUrl = BaseUrl();

        try {
            const response = await axios.post(`${submitUrl}/user/create/team`, combinedFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                console.log("team created details ", response.data);
                toast.success(response.data.message);
                dispatch(fetchTeams(token))
                handleCloseCreateTeam();

            } else {
                console.log("error in creating team", response.data);
                toast.error(response.data.message);
            }

        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="container-fluid create">

            <div className="">
                <ToastContainer />

                <div className="d-flex justify-content-between mt-2 details-options">
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
                        onPrev={handlePrev}
                    />
                )}
            </div>
        </div>
    );
};

export default Create;
