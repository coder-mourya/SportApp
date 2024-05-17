import React, { useState } from "react";
import Sidebar from "../../components/AfterLogin/Sidebar";
import SidebarSmallDevice from "../../components/AfterLogin/SidebarSmallDevice";
import arrow from "../../assets/afterLogin picks/My team/arrow.svg";
import "../../assets/Styles/AfterLogin/createTeam.css";
import "../../assets/Styles/AfterLogin/event.css";

import { useNavigate } from "react-router-dom";
import MemberStatus from "../../components/AfterLogin/Events/MemberStatus";

import pick1 from "../../assets/afterLogin picks/events/pic1.svg";
import pick2 from "../../assets/afterLogin picks/events/pic2.svg";
import pick3 from "../../assets/afterLogin picks/events/pic3.svg";
import pick4 from "../../assets/afterLogin picks/events/pic4.svg";
import eventpick from "../../assets/afterLogin picks/home/img.png";
import location from "../../assets/afterLogin picks/events/location.svg";






const EventDetails = () => {
    const [mainContainerClass, setMainContainerClass] = useState("col-md-11");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
        setMainContainerClass(sidebarOpen ? "col-md-11" : "col-md-10");
    };



    const members = [pick1, pick2, pick3, pick4, pick4, pick1, pick3, pick2];

    const maxToShow = 5;

    const extra = members.length - maxToShow;


    const Naviaget = useNavigate();

    const handleClose = () => {
        Naviaget("/CreateTeam")
    }

    // Dummy array of events
    // const trainings = [
    //     {
    //         id: 1,
    //         title: 'CUP-Semi final',
    //         location: 'Somerville, New Jersey',
    //         date: '21 Jan, 2023',
    //         time: '8AM - 10AM'
    //     },
    // ];

    return (
        <div className="container-fluid bodyColor ">
            <div className="row">
                <div className="col">
                    <Sidebar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                    <SidebarSmallDevice />
                </div>
                <div className={`${mainContainerClass} main mt-5`}>
                    <div className="member-dashbord">
                        <div className="d-flex  justify-content-between">
                            <div className=" d-flex">
                                <button className="btn prev-button" onClick={handleClose}>
                                    <img src={arrow} alt="previous" />
                                </button>

                                <h4 className="ms-3 mt-md-1">Event Details</h4>
                            </div>

                            <div className="me-4">
                                <button className="btn cancal-btn">Cancal</button>
                            </div>
                        </div>

                        <div className="row my-4">

                            <div className="col-md-8">

                                <div className=" itemsColor p-4 rounded-4 training-dashbord">


                                    <div class="container-fluid ">
                                        <div class="row">
                                            <div class="col-md-10 practice-btn">
                                                <button class="btn  mb-3">Practice</button>
                                                <h2>Practice event for </h2>
                                                <p>You</p>

                                            </div>
                                            <div class="col-md-2 d-flex align-items-center">
                                                <img src={eventpick} alt="Event illustration" class="img-fluid" />
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-between mt-3">
                                            <div> 
                                                <h4 class="mt-4">Location</h4>
                                                <p>A-199, sector 63, noida (u.P.)</p>
                                            </div>

                                            <div className="d-flex align-content-end">
                                                <img src={location} alt="location" />
                                            </div>
                                        </div>

                                        <div className="my-5">
                                            <div class="row  border-top border-bottom pb-2 pt-4">
                                                <div class="col-md-6 d-flex justify-content-center">
                                                    <div>
                                                        <h5>21 Jan, 2023</h5>
                                                        <p className="text-center">Date</p>
                                                    </div>
                                                </div>
                                                <div class="col-md-6 d-flex justify-content-center">
                                                    <div>
                                                        <h5>8AM - 10AM</h5>
                                                        <p className="text-center">Time</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>







                                    <div className="mt-3">
                                        <h4>Notes</h4>

                                        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                                            industry’s standard dummy text ever since the 1500s, when an unknown printer took a galley.</p>
                                    </div>

                                    <div className="mt-3">
                                        <h4>Event members</h4>

                                        <div className="d-flex justify-content-between">
                                            <ul className="team-members">
                                                {members.slice(0, maxToShow).map((member, index) => (
                                                    <li key={index} className={index === maxToShow - 1 ? 'last-item' : ''}>
                                                        <img src={member} alt="members list" />
                                                    </li>
                                                ))}

                                                {extra > 0 && (
                                                    <li className="extra-count">
                                                        <span>&#43;{extra}</span>

                                                    </li>
                                                )}
                                            </ul>

                                            <div className="add-btn">
                                                <button className="btn ">Add member</button>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="col-md-4">

                                <div className="calender rounded-4  itemsColor p-4">

                                    <MemberStatus />
                                </div>

                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
