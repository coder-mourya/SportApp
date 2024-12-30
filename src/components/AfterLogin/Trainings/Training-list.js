import React, { useState } from "react";
import Sidebar from "../../../components/AfterLogin/Sidebar";
import SidebarSmallDevice from "../../../components/AfterLogin/SidebarSmallDevice";
import "../../../assets/Styles/colors.css";
import "../../../assets/Styles/AfterLogin/createTeam.css";
// import { useNavigate } from "react-router-dom";
import ChatBox from "../../../components/AfterLogin/Chats/ChatBox";
import ListView from "./Listview";
import Mapview from "./Mapview";
import search from "../../../assets/afterLogin picks/home/Search.png";
import filter from "../../../assets/afterLogin picks/home/filter.png";
import Offcanvas from 'react-bootstrap/Offcanvas';
import "../../../assets/Styles/AfterLogin/training.css"

const TrainingList = () => {
    const [selectedOption, setSelectedOption] = useState("List");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mainContainerClass, setMainContainerClass] = useState('col-md-11');



    // const Navigate = useNavigate();

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

            case "Map":
                return <Mapview />;
            default:
                return <ListView />;
        }
    };

    // filter 
    const [showFilter, setShowFilter] = useState(false);

    const handleShowFilter = () => {
        setShowFilter(true);
    }

    const handleCloseFilter = () => {
        setShowFilter(false);
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
                        <div className="row All-options my-4 d-flex justify-content-center  justify-content-md-between training-options">
                            <div className="col-md-6 col-lg-6 col-6  itemsColor py-2  text-center training-options-button"
                                
                            >
                                <button
                                    className={`btn mx-2 ${selectedOption === "List" ? "selected-button" : ""}`}
                                    onClick={() => handleOptionChange("List")}
                                >
                                    List view
                                </button>

                                <button
                                    className={`btn mx-2 ${selectedOption === "Map" ? "selected-button" : ""}`}
                                    onClick={() => handleOptionChange("Map")}
                                >
                                    Map view
                                </button>


                            </div>
                            <div className="col-md-6 col-lg-6 col-6 create-options py-2 ">
                                <div className=" d-flex justify-content-md-end justify-content-center ">
                                    <button className="btn d-flex justify-content-center align-items-center" style={{ borderRadius: "5px", backgroundColor: "#FFFFFF", width: "40px", height: "40px" }}>
                                        <img src={search} alt="search " style={{ width: "30px" }} />
                                    </button>

                                    <button className="btn filter-btn" style={{ borderRadius: "5px", backgroundColor: "#FFFFFF", width: "100px", height: "40px" }}

                                        onClick={handleShowFilter}
                                    >
                                        <img src={filter} alt="filter" style={{ width: "20px", height: "15px" }} /> Filter
                                    </button>


                                </div>
                            </div>
                        </div>
                    </div>
                    <div className=" d-flex justify-content-center">
                        {renderComponent()}
                    </div>

                    <ChatBox />
                </div>

                {/* filter */}

                <Offcanvas show={showFilter} onHide={handleCloseFilter} placement="end">
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>Filter</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <div className=" filter-container">
                            {/* Rating */}
                            <div className="mb-4">
                                <p className="filter-label ">Rating</p>
                                <div className="d-flex">
                                    <button className="btn btn-filter">1+</button>
                                    <button className="btn btn-filter">2+</button>
                                    <button className="btn btn-filter">3+</button>
                                    <button className="btn btn-filter">4+</button>
                                </div>
                            </div>

                            {/* Training type */}
                            <div className="mb-4">
                                <p className="filter-label">Training type</p>
                                <div className="d-flex">
                                    <button className="btn btn-filter-lg">Online</button>
                                    <button className="btn btn-filter-lg ms-2">Offline</button>
                                </div>
                            </div>

                            {/* Proficiency level */}
                            <div className="mb-4">
                                <p className="filter-label">Proficiency level</p>
                                <div className="d-flex">
                                    <button className="btn btn-filter-lg">Beginners</button>
                                    <button className="btn btn-filter-lg ms-2">Intermediate</button>
                                    <button className="btn btn-filter-lg ms-2">Professional</button>
                                </div>
                            </div>

                            {/* Age group */}
                            <div className="mb-4">
                                <p className="filter-label">Age group</p>
                                <input type="range" className="form-range custom-range" min="0" max="50" defaultValue="24" />
                            </div>

                            {/* Day of Training */}
                            <div className="mb-4">
                                <p className="filter-label">Day of Training</p>
                                <div className="d-flex">
                                    <button className="btn btn-day selected-day">M</button>
                                    <button className="btn btn-day ms-2">T</button>
                                    <button className="btn btn-day selected-day ms-2">T</button>
                                    <button className="btn btn-day ms-2">W</button>
                                    <button className="btn btn-day ms-2">F</button>
                                    <button className="btn btn-day ms-2">S</button>
                                    <button className="btn btn-day ms-2">S</button>
                                </div>
                            </div>

                            {/* Price per session */}
                            <div className="mb-4">
                                <p className="filter-label">Price per session</p>
                                <input type="range" className="form-range custom-range" min="0" max="80" defaultValue="24" />
                            </div>

                            {/* Location */}
                            <div className="mb-4">
                                <p className="filter-label">Location</p>
                                <div className="d-flex">
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="location" id="nearby" defaultChecked />
                                        <label className="form-check-label" htmlFor="nearby">
                                            Nearby
                                        </label>
                                    </div>
                                    <div className="form-check ms-3">
                                        <input className="form-check-input" type="radio" name="location" id="places" />
                                        <label className="form-check-label" htmlFor="places">
                                            Places
                                        </label>
                                    </div>
                                </div>
                            </div>

                           
                        </div>

                         {/* Buttons */}
                         <div className="fixed-bottom-container">
                                <div className="d-flex justify-content-between">
                                    <button className="btn btn-outline-danger btn-lg me-2">Reset</button>
                                    <button className="btn btn-danger btn-lg ms-2">Apply filter</button>
                                </div>
                            </div>
                    </Offcanvas.Body>
                </Offcanvas>
            </div>
        </div>
    );
};

export default TrainingList;
