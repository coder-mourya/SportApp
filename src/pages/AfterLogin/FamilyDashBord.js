import React, { useState } from "react";
import Sidebar from "../../components/AfterLogin/Sidebar";
import SidebarSmallDevice from "../../components/AfterLogin/SidebarSmallDevice";
import arrow from "../../assets/afterLogin picks/My team/arrow.svg";
import you from "../../assets/afterLogin picks/My team/you.svg";
import "../../assets/Styles/AfterLogin/createTeam.css";
import { teams } from "../../assets/DummyData/TeamData";
import bell from "../../assets/afterLogin picks/My team/bell.svg";
import CurrentTraining from "../../components/AfterLogin/CreateTeam/CurrentTraining";
import PreviousTraining from "../../components/AfterLogin/CreateTeam/PreviousTraining";
import { useNavigate } from "react-router-dom";

const FamilyDashBord = () => {
    const [selectedOption, setSelectedOption] = useState("currentTraining");

    const [mainContainerClass, setMainContainerClass] = useState("col-md-11");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
        setMainContainerClass(sidebarOpen ? "col-md-11" : "col-md-10");
    };

    // Function to handle button click and update selectedOption state
    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };

    // Render component according to the selected option
    const renderComponent = () => {
        switch (selectedOption) {
            case "currentTraining":
                return <CurrentTraining />;
            case "prevTraining":
                return <PreviousTraining />;
            default:
                return <CurrentTraining />;
        }
    };


    const Naviaget = useNavigate();

    const handleClose = () =>{
        Naviaget("/CreateTeam")
    }

    return (
        <div className="container-fluid bodyColor">
            <div className="row">
                <div className="col">
                    <Sidebar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                    <SidebarSmallDevice />
                </div>
                <div className={`${mainContainerClass} main mt-5`}>
                    <div className="member-dashbord">
                        <div className="">
                            <button className="btn prev-button" onClick={handleClose}>
                                <img src={arrow} alt="previous" />
                            </button>
                        </div>
                        <div className="row">
                            <div className="col-md-4">
                                <div className="member-profile rounded-4 p-4 my-4">
                                    <div className="card text-center">
                                        <img src={you} alt="member profile" className="mx-auto card-pick" />
                                        <div className="card-body text-center">
                                            <h5>Sourabh Singh</h5>
                                            <div className="d-flex justify-content-center align-items-center">
                                                <img src={bell} alt="bell" className="bell-icon" />
                                                <p className="ms-2 pt-2">21 Jan, 2016</p>
                                            </div>
                                            <p>Son</p>
                                        </div>
                                    </div>
                                    <hr style={{ borderTop: "2px solid #6972B4", margin: 0 }} />
                                    <div className="pt-2">
                                        <h4 className="text-white">My Sports</h4>

                                        <div className="row ">
                                            {teams.map((team, index) => (
                                                <div key={index} className="d-flex ms-2 my-1 mt-3 align-items-center member-sports col-md-6">
                                                    <div className="d-flex align-items-center justify-content-center">
                                                        <img src={team.sportIcon} alt="sport icon" />
                                                        <p className="sport-text text-dark ms-3">{team.sportType}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-8">
                                <div className="dashbord-container itemsColor rounded-4  p-3 mt-4">

                                    <div className="row All-options my-2 d-flex justify-content-center justify-content-md-start ">
                                        <div className="col-md-6 col-lg-6 Team-options itemsColor py-2 text-center rounded ">
                                            <button
                                                className={`btn ${selectedOption === "currentTraining" ? "btn-primary" : ""}`}
                                                onClick={() => handleOptionChange("currentTraining")}
                                            >
                                                Current Training
                                            </button>
                                            <button
                                                className={`btn ${selectedOption === "prevTraining" ? "btn-primary" : ""}`}
                                                onClick={() => handleOptionChange("prevTraining")}
                                            >
                                                Previous Training
                                            </button>
                                        </div>
                                    </div>


                                    {/* Render the component based on the selectedOption state */}
                                    <div className="container-fluid d-flex justify-content-center">{renderComponent()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FamilyDashBord;
