import React, { useState } from "react";
import Sidebar from "../../components/AfterLogin/Sidebar";
import SidebarSmallDevice from "../../components/AfterLogin/SidebarSmallDevice";
import MyTeam from "../../components/AfterLogin/CreateTeam/MyTeam";
import AllMembers from "../../components/AfterLogin/CreateTeam/AllMembers";
import MyFamily from "../../components/AfterLogin/CreateTeam/MyFamily";
import "../../assets/Styles/colors.css";
import "../../assets/Styles/AfterLogin/createTeam.css"
import search from "../../assets/afterLogin picks/My team/search.svg";

const CreateTeam = () => {
    const [selectedOption, setSelectedOption] = useState("myTeam");

    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };

    const renderComponent = () => {
        switch (selectedOption) {
            case "allMembers":
                return <AllMembers />;
            case "myFamily":
                return <MyFamily />;
            default:
                return <MyTeam />;
        }
    };

    return (
        <div className="container-fluid create-team row bodyColor">
            <div className="col-md-2">
                <Sidebar />
                <SidebarSmallDevice />
            </div>
            <div className="col-md-10 mb-5">
                <div className="upper-contant ">
                    <div className="row All-options my-4 ">
                        <div className="col-md-6 Team-options itemsColor py-2  rounded ">
                            <button
                                className={`btn ${selectedOption === "myTeam" ? "btn-primary" : ""}`}
                                onClick={() => handleOptionChange("myTeam")}
                            >
                                My Team
                            </button>
                            <button
                                className={`btn ${selectedOption === "allMembers" ? "btn-primary" : ""}`}
                                onClick={() => handleOptionChange("allMembers")}
                            >
                                All Members
                            </button>
                            <button
                                className={`btn ${selectedOption === "myFamily" ? "btn-primary" : ""}`}
                                onClick={() => handleOptionChange("myFamily")}
                            >
                                My Family
                            </button>
                        </div>
                        <div className="col-md-6 create-options py-2 ">
                            <div className=" d-flex justify-content-end">
                            <button className="btn ">
                                <img src={search} alt="search icons" />
                            </button>
                            <button className="btn border-danger">Join with code</button>
                            <button className="btn border-danger btn-danger">Create team</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container d-flex justify-content-center">{renderComponent()}</div>
            </div>
        </div>
    );
};

export default CreateTeam;
