import React, { useState } from "react";
import Sidebar from "../../components/AfterLogin/Sidebar";
import SidebarSmallDevice from "../../components/AfterLogin/SidebarSmallDevice";
import Practice from "../../components/AfterLogin/CreatePractice/Practice";
import Game from "../../components/AfterLogin/CreatePractice/Game";
import Tournament from "../../components/AfterLogin/CreatePractice/Tournament";
import "../../assets/Styles/colors.css";
import "../../assets/Styles/AfterLogin/createTeam.css";
import { useNavigate } from "react-router-dom";


const EventDashBord = () => {
    const [selectedOption, setSelectedOption] = useState("Practice");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mainContainerClass, setMainContainerClass] = useState('col-md-11');



    const Navigate = useNavigate();

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
        setMainContainerClass(sidebarOpen ? 'col-md-11 ' : 'col-md-10 ');
    };


    // handle options slections
    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };

    const renderComponent = () => {
        switch (selectedOption) {
            case "Game":
                return <Game />;
            case "Tournament":
                return <Tournament />;
            default:
                return <Practice />;
        }
    };

    // handle create team navigation
    const handleCreate = (event) => {
        event.preventDefault();
        Navigate("/CreatePracticeForm")
    }

    const handleGameCreate = (event) => {
        event.preventDefault();
        Navigate("/CreateGame")
    }

    const handleTournamentCreate = (event) => {
        event.preventDefault();
        Navigate("/CreateTournament")
    }

    const renderButton = () => {
        switch (selectedOption) {
            case "Game":
                return <button className="btn btn-danger mx-2" onClick={handleGameCreate}>
                    Create Game
                </button>;
            case "Tournament":
                return <button className="btn btn-danger mx-2" onClick={handleTournamentCreate}>
                    Create Tournament
                </button>;
            default:
                return <button className="btn btn-danger mx-2" onClick={handleCreate}>
                    Create practice
                </button>
        }
    }



    return (
        <div className="container-fluid create-team  bodyColor ">
            <div className="row">
                <div className="col">
                    <Sidebar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                    <SidebarSmallDevice />
                </div>
                <div className={`${mainContainerClass}  main mt-2`}>


                    <div className="upper-contant ">
                        <div className="row All-options my-4 d-flex justify-content-center  justify-content-md-start">
                            <div className="col-md-6 col-lg-6 Team-options itemsColor py-2  text-center ">
                                <button
                                    className={`btn ${selectedOption === "Practice" ? "btn-primary" : ""}`}
                                    onClick={() => handleOptionChange("Practice")}
                                >
                                    Practice
                                </button>
                                <button
                                    className={`btn ${selectedOption === "Game" ? "btn-primary" : ""}`}
                                    onClick={() => handleOptionChange("Game")}
                                >
                                    Game
                                </button>
                                <button
                                    className={`btn ${selectedOption === "Tournament" ? "btn-primary" : ""}`}
                                    onClick={() => handleOptionChange("Tournament")}
                                >
                                    Tournament
                                </button>
                            </div>
                            <div className="col-md-6 col-lg-6 create-options py-2 ">
                                <div className=" d-flex justify-content-md-end justify-content-center ">

                                    {renderButton()}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className=" d-flex justify-content-center">
                        {renderComponent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDashBord;
