import React, { useState } from "react";
import TeamDetails from "./TeamDetails";
import AboutMe from "./AboutMe";
import cros from "../../../assets/afterLogin picks/My team/Cross.svg";
import { useNavigate } from "react-router-dom";

const Create = () => {
    const [selectedStep, setSelectedStep] = useState(1); // State to track the selected step
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
                {selectedStep === 1 ? <TeamDetails onNext={handleNext} /> : <AboutMe />}
            </div>
        </div>
    );
};

export default Create;
