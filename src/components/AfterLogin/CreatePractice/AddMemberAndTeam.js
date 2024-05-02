import React from "react";
import cros from "../../../assets/afterLogin picks/My team/Cross.svg";
import { useNavigate } from "react-router-dom";
import "../../../assets/Styles/AfterLogin/Addmember.css";
import AllMembers from "../CreateTeam/AllMembers";
import MyTeam from "../CreateTeam/MyTeam";
import { useState } from "react";

// Modified version of MyTeam component
const ModifiedMyTeam = () => {
    // Your modifications here
    return (
        <div className="ModifiedMyTeam">
            <MyTeam />
        </div>
    );
};

// Modified version of AllMembers component
const ModifiedAllMembers = () => {
    // Your modifications here
    return (
        <div className="ModifiedAllMembers">
            <AllMembers />
        </div>
    );
};

const AddMemberAndTeam = () => {
    const [selectedOption, setSelectedOption] = useState("MyTeam");

    // handle options selections
    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };

    const Navigate = useNavigate();

    // Function to navigate back to the main page
    const handleCros = () => {
        Navigate("/CreatePracticeForm");
    };

    // Render buttons based on selected option
    const renderButtons = () => {
        if (selectedOption === "MyTeam") {
            return (
                <button className="btn  mx-2">Add Team</button>
            );
        } else if (selectedOption === "AllMembers") {
            return (
                <button className="btn  mx-2">Add Member</button>
            );
        }
    };

    return (
        <div className="container-fluid Add-member-and-team">
            <div className="background"></div>
            <div className="half-container p-4">
                <div className="d-flex justify-content-between align-items-center">
                    <h2>Add member/Team</h2>
                    <img src={cros} alt="cross button" className="cross-button" onClick={handleCros} />
                </div>

                <div className=" itemsColor py-2 my-1 rounded-4 team-and-member-btn  border d-flex   justify-content-center  ">
                    <button
                        className={`btn ${selectedOption === "MyTeam" ? "btn-primary" : ""}`}
                        onClick={() => handleOptionChange("MyTeam")}
                    >
                        Team
                    </button>
                    <button
                        className={`btn ${selectedOption === "AllMembers" ? "btn-primary" : ""}`}
                        onClick={() => handleOptionChange("AllMembers")}
                    >
                        AllMembers
                    </button>
                </div>

                <div className="container-fluid">
                    {/* Render selected component */}
                    {selectedOption === "MyTeam" ? <ModifiedMyTeam /> : <ModifiedAllMembers />}
                </div>

                {/* Render buttons */}
                <div className="d-flex justify-content-center mt-4 add-buttons">
                    {renderButtons()}
                </div>
            </div>
        </div>
    );
};

export default AddMemberAndTeam;
