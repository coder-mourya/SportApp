import React from "react";
import Sidebar from "../../../components/AfterLogin/Sidebar";
import SidebarSmallDevice from "../../../components/AfterLogin/SidebarSmallDevice";
import { useState } from "react";
import arrow from "../../../assets/afterLogin picks/My team/arrow.svg";
import "../../../assets/Styles/AfterLogin/createTeam.css";
import "../../../assets/Styles/AfterLogin/practice.css";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import date from "../../../assets/afterLogin picks/Practice/date.svg"





const CreatePracticeForm = () => {

    const [mainContainerClass, setMainContainerClass] = useState('col-md-11');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const datePickerRef = useRef(null);
    const startTimePickerRef = useRef(null);
    const endTimePickerRef = useRef(null);

    const handleDateFocus = () => {
        if (datePickerRef.current) {
            datePickerRef.current.showPicker();
        }
    };

    const handleStartTimeFocus = () => {
        if (startTimePickerRef.current) {
            startTimePickerRef.current.showPicker();
        }
    };

    const handleEndTimeFocus = () => {
        if (endTimePickerRef.current) {
            endTimePickerRef.current.showPicker();
        }
    };





    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
        setMainContainerClass(sidebarOpen ? 'col-md-11 ' : 'col-md-10 ');
    };


    // handle crose button
    const Navigate = useNavigate();
    const handleCros = () => {
        Navigate("/PracticeDashBord")
    }

    const handleAddTeam = () =>{
        Navigate("/AddMemberAndTeam")
    }


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
                            <button className="btn  prev-button me-3" onClick={handleCros}><img src={arrow} alt="prevus" /></button>
                            <h3>Create Practice</h3>
                        </div>

                        <div className="dashbord-container itemsColor rounded p-3 mt-4">


                            <form className="form practice-form">
                                <div className="row">
                                    <div className="col-md-8">
                                        <label htmlFor="name">Event Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter name"
                                            className=" form-control"

                                        />
                                    </div>

                                    <div class="col-md-4">
                                        <label for="sportType">Sport type</label>
                                        <select name="sportType" id="sportType" class="form-control sport-select">
                                            <option value="">Select</option>
                                        </select>
                                    </div>

                                </div>

                                <div className="row">
                                    <div className="col-md-4 mt-2">
                                        <label htmlFor="date">Date</label>
                                        <div className="input-group  date position-relative">
                                            <input
                                                type="text"
                                                id="date"
                                                name="date"
                                                className="form-control dateinput"
                                                placeholder="Select date"
                                                onFocus={handleDateFocus}
                                            />
                                            <span className=" input-with-icon date-icon">
                                                <img src={date} alt="date" />
                                            </span>
                                        </div>
                                        <input
                                            type="date"
                                            id="datePicker"
                                            ref={datePickerRef}
                                            className="d-none"
                                        />
                                    </div>
                                    <div className="col-md-4 mt-2">
                                        <label htmlFor="startTime">Start time</label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                id="startTime"
                                                name="startTime"
                                                className="form-control"
                                                placeholder="Select start time"
                                                onFocus={handleStartTimeFocus}
                                            />

                                        </div>
                                        <input
                                            type="time"
                                            id="startTimePicker"
                                            ref={startTimePickerRef}
                                            className="d-none"
                                        />
                                    </div>
                                    <div className="col-md-4 mt-2">
                                        <label htmlFor="endTime">End time</label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                id="endTime"
                                                name="endTime"
                                                className="form-control"
                                                placeholder="Select end time"
                                                onFocus={handleEndTimeFocus}
                                            />

                                        </div>
                                        <input
                                            type="time"
                                            id="endTimePicker"
                                            ref={endTimePickerRef}
                                            className="d-none"
                                        />
                                    </div>
                                </div>



                                <div className="row">
                                    <div className="mt-2">
                                        <label htmlFor="Facility">Facility</label>
                                        <input type="text"
                                            placeholder="Search facility"
                                            className=" form-control"
                                        />
                                    </div>

                                    <div className="mt-2">
                                        <label htmlFor="note">Add notes</label>
                                        <textarea
                                            name="note"
                                            id="note"
                                            cols="30"
                                            rows="10"
                                            placeholder="Dear Sir/Madam, Weogram in our school. In which"
                                            className=" form-control"
                                        >

                                        </textarea>
                                    </div>
                                </div>

                                <div className="mt-2 Add-member-btn">
                                    <button  onClick={handleAddTeam}><i class="fa-solid fa-plus" ></i> Add Member/Team</button>
                                </div>

                                <div className="mt-5 creat-practice-btn">
                                    <button className="btn btn-danger">
                                        Create practice
                                    </button>
                                </div>

                            </form>


                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default CreatePracticeForm; 