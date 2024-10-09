import React, { useState } from "react";
import Sidebar from "../../components/AfterLogin/Sidebar";
import SidebarSmallDevice from "../../components/AfterLogin/SidebarSmallDevice";
import arrow from "../../assets/afterLogin picks/My team/arrow.svg";
import "../../assets/Styles/AfterLogin/createTeam.css";
import { useNavigate } from "react-router-dom";
import banner2 from "../../assets/afterLogin picks/My team/banner2.png";
import location from "../../assets/afterLogin picks/home/location.png";
import schedule from "../../assets/afterLogin picks/home/schedule.png";
import watch from "../../assets/afterLogin picks/home/watch.png";
import Sessions from "../../components/AfterLogin/CreatePractice/Sessions";
import Offcanvas from 'react-bootstrap/Offcanvas';



const TrainingDashBord = () => {
    const [mainContainerClass, setMainContainerClass] = useState("col-md-11");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
        setMainContainerClass(sidebarOpen ? "col-md-11" : "col-md-10");
    };


    const Naviaget = useNavigate();

    const handleClose = () => {
        Naviaget("/loggedInHome");
    }

    // Dummy array of events
    const trainings = [
        {
            id: 1,
            title: 'CUP-Semi final',
            location: 'Somerville, New Jersey',
            date: '21 Jan, 2023',
            time: '8AM - 10AM'
        },
    ];

    const [showAvailability, setShowAvailability] = useState(false);

    const handleShowAvailability = () => {
        setShowAvailability(true);
    };

    const handleCloseAvailability = () => {
        setShowAvailability(false);
    };



    return (
        <div className="container-fluid bodyColor training-dashbord-container">
            <div className="row">
                <div className="col">
                    <Sidebar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                    <SidebarSmallDevice />
                </div>
                <div className={`${mainContainerClass} main mt-3`}>
                    <div className="member-dashbord">

                        <div className="d-flex justify-content-between">
                            <div className="d-flex align-items-center">
                                <button className="btn prev-button" onClick={handleClose}>
                                    <img src={arrow} alt="previous" />
                                </button>

                                <h4 className="ms-3">Facility details</h4>
                            </div>

                            <div>
                                <button className="btn btn-danger" onClick={handleShowAvailability}>Check Availability</button>
                            </div>
                        </div>

                        <div className="row my-4">

                            <div className="col-md-8">

                                <div className=" itemsColor p-4 rounded-4 training-dashbord">

                                    <div className="d-flex justify-content-center banner2">
                                        <img src={banner2} alt="statdiam pick" />

                                    </div>

                                    <div className="mt-3">
                                        <h4>Youth Badminton Training</h4>
                                    </div>

                                    {trainings.map(trainings => (
                                        <div key={trainings.id} className=" col-md-1  event-item  my-3 rounded-4 d-flex ">

                                            <div className="event-icons">

                                                <div className="mb-2">
                                                    <div className="d-flex ">
                                                        <img src={location} alt="location" className="me-2 " />
                                                        <p className="mb-0">
                                                            {window.innerWidth <= 576 ? trainings.location.substring(0, 10) + "..." : trainings.location}

                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mb-2">
                                                    <div className="d-flex ">
                                                        <img src={schedule} alt="schedule" className="me-2 " />
                                                        <p className="mb-0">{trainings.date}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="d-flex ">
                                                        <img src={watch} alt="watch" className="me-2" />
                                                        <p className="mb-0">{trainings.time}</p>
                                                    </div>
                                                </div>
                                            </div>


                                        </div>

                                    ))}

                                    <div className="mt-3">
                                        <h4>Curriculum</h4>

                                        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                                            industry’s standard dummy text ever since the 1500s, when an unknown printer took a galley.</p>
                                    </div>

                                    <div className="mt-3">
                                        <h4>Expectation from training</h4>
                                        <p>Interested in long term training…</p>
                                    </div>

                                </div>
                            </div>

                            <div className="col-md-4">

                                <div className="calender rounded-4  itemsColor p-4">

                                    <Sessions />

                                </div>

                            </div>

                        </div>

                        {/* check availablity */}

                        <Offcanvas show={showAvailability} onHide={handleCloseAvailability} placement="end">
                            <Offcanvas.Header closeButton>
                                <Offcanvas.Title>Check availability</Offcanvas.Title>
                            </Offcanvas.Header>

                            <Offcanvas.Body>
                                {/* Step progress bar */}
                                <div className="step-progress">
                                    <div className="step-item active">
                                        <span className="step-number">1</span>
                                        <p>Select member</p>
                                    </div>
                                    <div className="step-item">
                                        <span className="step-number">2</span>
                                        <p>Select Date & Time</p>
                                    </div>
                                    <div className="step-item">
                                        <span className="step-number">3</span>
                                        <p>Your cart</p>
                                    </div>
                                </div>

                                {/* Booking for Section */}
                                <div className="booking-section">
                                    <p className="booking-title">Booking for</p>
                                    <div className="radio-options d-flex">
                                        <div className="form-check me-4">
                                            <input className="form-check-input" type="radio" name="bookingFor" id="myself" defaultChecked />
                                            <label className="form-check-label" htmlFor="myself">Myself</label>
                                        </div>
                                        <div className="form-check">
                                            <input className="form-check-input" type="radio" name="bookingFor" id="familyMember" />
                                            <label className="form-check-label" htmlFor="familyMember">Family Member</label>
                                        </div>
                                    </div>

                                    {/* Avatar selection */}
                                    <div className="member-avatars d-flex justify-content-start mt-3">
                                        <div className="avatar selected">
                                            <img src="avatar1.jpg" alt="Avatar 1" />
                                        </div>
                                        <div className="avatar">
                                            <img src="avatar2.jpg" alt="Avatar 2" />
                                        </div>
                                        <div className="avatar">
                                            <img src="avatar3.jpg" alt="Avatar 3" />
                                        </div>
                                        {/* Add additional avatar elements as needed */}
                                    </div>
                                </div>
                            </Offcanvas.Body>

                            {/* Bottom fixed button */}
                            <div className="offcanvas-footer">
                                <button className="btn btn-danger w-100 mx-2">Next</button>
                            </div>
                        </Offcanvas>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainingDashBord;
