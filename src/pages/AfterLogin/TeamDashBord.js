import React from "react";
import Sidebar from "../../components/AfterLogin/Sidebar";
import SidebarSmallDevice from "../../components/AfterLogin/SidebarSmallDevice";
import { useState } from "react";
import arrow from "../../assets/afterLogin picks/My team/arrow.svg";
import teamLogo from "../../assets/afterLogin picks/My team/kkr.png";
import teamIcon from "../../assets/afterLogin picks/My team/teamicon.svg";
import you from "../../assets/afterLogin picks/My team/you.svg";
import seting from "../../assets/afterLogin picks/My team/Setting.svg";
import Delete from "../../assets/afterLogin picks/My team/delete.svg";
import other from "../../assets/afterLogin picks/My team/other.svg";
import "../../assets/Styles/AfterLogin/createTeam.css"




const TeamDashbord = () => {

    const [mainContainerClass, setMainContainerClass] = useState('col-md-11');
    const [sidebarOpen, setSidebarOpen] = useState(false);


    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
        setMainContainerClass(sidebarOpen ? 'col-md-11 ' : 'col-md-10 ');
    };


    return (
        <div className="container-fluid   bodyColor">

            <div className="row">
            <div className="col">
                <Sidebar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                <SidebarSmallDevice />
            </div>

            <div className={`${mainContainerClass}  main mt-5 `}>


                <div className=" team-dashbord">

                    <div className="d-flex">
                        <button className="btn  prev-button me-3"><img src={arrow} alt="prevus" /></button>
                        <h3>KKR Team</h3>
                    </div>

                    <div className="dashbord-container itemsColor rounded p-3 mt-4">

                        <div className="team-banner rounded d-flex justify-content-center align-items-center">
                            <div className="text-center">
                                <img src={teamLogo} alt="teamlogo" className="teamlogo" />
                                <p className=" text-white">KKR</p>
                                <img src={teamIcon} alt="" className="team-icon w-75" />
                            </div>
                        </div>

                        <div className="members-list  mt-5">

                            <div className="row ">

                                <div className="col-md-4">
                                    <div className=" d-flex align-items-center border p-2 my-2 my-md-3 rounded">
                                        <div className="you">
                                            <img src={you} alt="you" />
                                        </div>
                                        <div className="p-2 flex-grow-1">
                                            <p className="text-muted  mb-1 ms-2">created by</p>
                                            <p className="ms-2">you</p>
                                        </div>
                                        <div className="d-flex align-items-center ms-auto">
                                            <img src={seting} alt="you" />
                                        </div>
                                    </div>
                                </div>




                                <div className="col-md-4">
                                    <div className=" d-flex align-items-center border p-2  my-2 my-md-3 rounded">
                                        <div className="you">
                                            <img src={other} alt="you" />
                                        </div>
                                        <div className="p-2 flex-grow-1">
                                            <p className=" mt-2 mb-1 ms-2">Gourab</p>

                                        </div>
                                        <div className="d-flex align-items-center ms-auto">
                                            <img src={Delete} alt="delete" />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-4">

                                    <div className=" d-flex align-items-center border p-2 my-2 my-md-3 rounded">
                                        <div className="you">
                                            <img src={other} alt="you" />
                                        </div>
                                        <div className="p-2 flex-grow-1">
                                            <p className=" mt-2 mb-1 ms-2">Gourab</p>

                                        </div>
                                        <div className="d-flex align-items-center ms-auto">
                                            <img src={Delete} alt="delete" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row">

                                <div className="col-md-4">
                                    <div className=" d-flex align-items-center border p-2 my-2 my-md-3 rounded">
                                        <div className="you">
                                            <img src={other} alt="you" />
                                        </div>
                                        <div className="p-2 flex-grow-1">
                                            <p className=" mt-2 mb-1 ms-2">Abhishek gupta</p>

                                        </div>
                                        <div className="d-flex align-items-center ms-auto">
                                            <img src={Delete} alt="delete" />
                                        </div>
                                    </div>
                                </div>




                                <div className="col-md-4">
                                    <div className=" d-flex align-items-center border p-2 my-2 my-md-3 rounded">
                                        <div className="you">
                                            <img src={other} alt="you" />
                                        </div>
                                        <div className="p-2 flex-grow-1">
                                            <p className=" mt-2 mb-1 ms-2">Sameer sharma</p>

                                        </div>
                                        <div className="d-flex align-items-center ms-auto">
                                            <img src={Delete} alt="delete" />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-4">

                                    <div className=" d-flex align-items-center border p-2 my-2 my-md-3 rounded">
                                        <div className="you">
                                            <img src={other} alt="you" />
                                        </div>
                                        <div className="p-2 flex-grow-1">
                                            <p className=" mt-2 mb-1 ms-2">Gourab</p>

                                        </div>
                                        <div className="d-flex align-items-center ms-auto">
                                            <img src={Delete} alt="delete" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
            </div>
        </div>
    )
}

export default TeamDashbord; 