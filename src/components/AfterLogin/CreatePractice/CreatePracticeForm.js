import React from "react";
import Sidebar from "../../../components/AfterLogin/Sidebar";
import SidebarSmallDevice from "../../../components/AfterLogin/SidebarSmallDevice";
import { useState } from "react";
import arrow from "../../../assets/afterLogin picks/My team/arrow.svg";
import "../../../assets/Styles/AfterLogin/createTeam.css";
import "../../../assets/Styles/AfterLogin/practice.css";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import date from "../../../assets/afterLogin picks/Practice/date.svg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";





const CreatePracticeForm = () => {

    const [mainContainerClass, setMainContainerClass] = useState('col-md-11');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);

    const datePickerRef = useRef(null);
    const startTimePickerRef = useRef(null);
    const endTimePickerRef = useRef(null);


    const handleDateChange = (date) => {
        setStartDate(date);
    };

    const handleStartTimeChange = (time) => {
        setStartTime(time);
    };

    const handleEndTimeChange = (time) => {
        setEndTime(time);
    };

    const handleDateFocus = () => {
        if (datePickerRef.current) {
            datePickerRef.current.setOpen(true);
        }
    };

    const handleStartTimeFocus = () => {
        if (startTimePickerRef.current) {
            startTimePickerRef.current.setOpen(true);
        }
    };

    const handleEndTimeFocus = () => {
        if (endTimePickerRef.current) {
            endTimePickerRef.current.setOpen(true);
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

    const handleAddTeam = () => {
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
                                        <div className="input-group date position-relative">
                                            <DatePicker
                                                selected={startDate}
                                                onChange={handleDateChange}
                                                className=" dateinput"
                                                placeholderText="Select date"
                                                onFocus={handleDateFocus}
                                                ref={datePickerRef}
                                            />
                                            <span className="input-with-icon date-icon">
                                                <img src={date} alt="date" />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-md-4 mt-2">
                                        <label htmlFor="startTime">Start time</label>
                                        <div className="input-group">
                                            <DatePicker
                                                selected={startTime}
                                                onChange={handleStartTimeChange}
                                                showTimeSelect
                                                showTimeSelectOnly
                                                timeIntervals={15}
                                                dateFormat="h:mm aa"
                                                className="form-control"
                                                placeholderText="Select start time"
                                                onFocus={handleStartTimeFocus}
                                                ref={startTimePickerRef}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-4 mt-2">
                                        <label htmlFor="endTime">End time</label>
                                        <div className="input-group">
                                            <DatePicker
                                                selected={endTime}
                                                onChange={handleEndTimeChange}
                                                showTimeSelect
                                                showTimeSelectOnly
                                                timeIntervals={15}
                                                dateFormat="h:mm aa"
                                                className="form-control"
                                                placeholderText="Select end time"
                                                onFocus={handleEndTimeFocus}
                                                ref={endTimePickerRef}
                                            />
                                        </div>
                                    </div>
                                </div>




                                <div className="row">
                                    <div className="mt-2">
                                        <label htmlFor="Facility">Facility</label>
                                        <input type="search"
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
                                    <button onClick={handleAddTeam}><i class="fa-solid fa-plus" ></i> Add Member/Team</button>
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