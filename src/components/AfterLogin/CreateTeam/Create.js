import React, { useState } from "react";
import TeamDetails from "./TeamDetails"; 
import AboutMe from "./AboutMe"; 
import "../../../assets/Styles/AfterLogin/createTeam.css";
import cros from "../../../assets/afterLogin picks/My team/Cross.svg";
import { useNavigate } from "react-router-dom";

const Create = () => {
    const [selectedStep, setSelectedStep] = useState(1); // State to track the selected step

    // Function to handle step selection
    const handleStepSelect = (step) => {
        setSelectedStep(step);
    };

    // Function to render the selected component based on the selected step
    const renderComponent = () => {
        switch (selectedStep) {
            case 1:
                return <TeamDetails />;
            case 2:
                return <AboutMe />;
            default:
                return <TeamDetails />; // Return null for unknown steps
        }
    };

    const Navigate = useNavigate();

    const handleCros = () =>{
        Navigate("/CreateTeam")
    }

    return (
        <div className="container-fluid create">
            <div className="background"></div>
            <div className="half-container p-4">
                <div className="d-flex justify-content-between align-items-center">
                    <h2>Create team</h2>
                    <img src={cros} alt="cross button" className="cross-button" onClick={handleCros}/>
                </div>
                <div className="d-flex justify-content-between mt-4 details-options">
                    <div className="text-center">
                        <button
                            className={`btn  ${selectedStep === 1 ? "selected" : ""}`}
                            onClick={() => handleStepSelect(1)}
                        >
                            1
                        </button>
                        <p >Team details</p>
                    </div>
                    <p className="mt-1 line">-----------------------------------------------------------------------------------</p>
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
                {renderComponent()}
            </div>
        </div>
    );
};

export default Create;
