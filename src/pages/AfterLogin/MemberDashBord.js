import React from "react";
import Sidebar from "../../components/AfterLogin/Sidebar";
import SidebarSmallDevice from "../../components/AfterLogin/SidebarSmallDevice";
import { useState } from "react";
import arrow from "../../assets/afterLogin picks/My team/arrow.svg";
// import teamLogo from "../../assets/afterLogin picks/My team/kkr.svg";
// import teamIcon from "../../assets/afterLogin picks/My team/teamicon.svg";
import you from "../../assets/afterLogin picks/My team/you.svg";
// import seting from "../../assets/afterLogin picks/My team/Setting.svg";
// import Delete from "../../assets/afterLogin picks/My team/delete.svg";
// import other from "../../assets/afterLogin picks/My team/other.svg";
import "../../assets/Styles/AfterLogin/createTeam.css"
import { teams } from "../../assets/DummyData/TeamData";




const MemberDashBord = () => {

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


                    <div className="member-dashbord">

                        <div className="">
                            <button className="btn  prev-button"><img src={arrow} alt="prevus" /></button>

                        </div>

                        <div className="row">

                            <div className="col-md-4">

                                <div className="member-profile rounded p-4 my-4">
                                    <div className="card text-center">
                                        <img src={you} alt="member profile" className="mx-auto" />

                                        <div className="card-body text-center">

                                            <h5>Sourabh singh</h5>
                                            <p>sourabh_singh@gmail.com</p>
                                            <p>9899334339</p>
                                        </div>

                                    </div>

                                    <hr style={{ borderTop: '2px solid #6972B4', margin: 0 }} />

                                    <div className="pt-2">
                                        <h4 className="text-white">My Sports</h4>

                                        <div className="row">
                                            {teams.map((team, index) => (
                                                <div key={index} className="d-flex ms-2 my-1 align-items-center member-sports col-md-6">
                                                    <div className="d-flex align-items-center justify-content-center">
                                                        <img src={team.sportIcon} alt="sporticon" />
                                                        <p className="sport-text text-dark ms-3">{team.sportType}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>


                                    </div>
                                </div>

                            </div>


                            <div className="col-md-8">

                                <div className="dashbord-container itemsColor rounded p-3 mt-4">
                                    <div className=" d-flex justify-content-between" >
                                        <h4>Sourabh’s team</h4>
                                        <button className="btn btn-danger">Add</button>
                                    </div>


                                    <div className="row justify-content-center align-items-center p-md-5">
                                        {teams.map((team, index) => (

                                            <div key={index} className="col-12 col-md-6 mb-3 mt-2  ">

                                                <div className="d-flex align-items-center teams-container p-3">
                                                    {/* Step 1: Image (unchanged) */}
                                                    <img src={team.image} className="card-img-top main-pick" alt="Team" />

                                                    {/* Step 2: Team Name and Sport Icon */}
                                                    <div className="ms-3 ">
                                                        <div className="teamName   mb-3">
                                                            <h5 className="card-title">{team.teamName}</h5>
                                                        </div>

                                                        <div className="d-flex justify-content-center  sportIcon px-2 ">
                                                            <div className="mx-2 d-flex  align-items-center">
                                                                <img src={team.sportIcon} alt="sporticon" />
                                                            </div>
                                                            <div className="mx-2 ">
                                                                <p className="sport-text">
                                                                    {/* slice text in small screens */}
                                                                    {window.innerWidth <= 1284 ? (
                                                                        team.sportType.slice(0, 7) + ".."
                                                                    ) : (
                                                                        team.sportType
                                                                    )}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                   
                                                </div>
                                            </div>
                                        ))}
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

export default MemberDashBord; 