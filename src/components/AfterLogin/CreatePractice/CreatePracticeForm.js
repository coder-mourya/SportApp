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
import success from "../../../assets/afterLogin picks/events/pic5.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Offcanvas from "react-bootstrap/Offcanvas";
import AddMemberAndTeam from "../CreatePractice/AddMemberAndTeam";
import { Autocomplete } from '@react-google-maps/api';
import { toast, ToastContainer } from "react-toastify";
import { BaseUrl } from "../../../reducers/Api/bassUrl";
import axios from "axios";
import { useSelector } from "react-redux";
import Modal from 'react-bootstrap/Modal';
import moment from 'moment';
import { ThreeDots } from "react-loader-spinner";


const CreatePracticeForm = () => {

    const [mainContainerClass, setMainContainerClass] = useState('col-md-11');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedTeamds, setSelectedTeamds] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [autoComplte, setAutoComplte] = useState(null);
    const datePickerRef = useRef(null);
    // const startTimePickerRef = useRef(null);
    const endTimePickerRef = useRef(null);
    const token = useSelector(state => state.auth.user.data.user.token);
    const user = useSelector(state => state.auth.user.data.user);
    const chosenSports = user.chosenSports;
    const [modelShow, setModelShow] = useState(false);



    const [formData, setFormData] = useState({
        eventName: "",
        eventType: "practice",
        opponentName: "",
        sportId: "",
        latitude: "",
        longitude: "",
        address: "",
        eventDate: "",
        startTime: "",
        endTime: "",
        notes: "",
        eventMembers: [],
        teamIds: [],
        creatorIsAdmin: true,

    });

    const [loading, setLoading] = useState(false);

    const [showAddMemberAndTeam, setShowAddMemberAndTeam] = useState(false);
    const handleShowAddMemberAndTeam = () => {
        setShowAddMemberAndTeam(true)
    }

    const handleCloseAddMemberAndTeam = () => setShowAddMemberAndTeam(false)

    const handleShowModel = () => {
        setModelShow(true)
    }

    const handleCloseModel = () => setModelShow(false)


    // const handleDateChange = (date) => {
    //     const year = date.getFullYear();
    //     const month = date.getMonth() + 1;
    //     const day = date.getDate();
    //     const formatedDate = `${year}-${month}-${day}`;
    //     setFormData((prevFormData) => ({
    //         ...prevFormData,
    //         eventDate: formatedDate,
    //         startTime: "",
    //         endTime: ""
    //     }));
    // };

    const handleDateChange = (date) => {
        const formattedDate = moment(date).format('YYYY-MM-DD');
        setFormData((prevFormData) => ({
            ...prevFormData,
            eventDate: formattedDate,
            startTime: '',
            endTime: ''
        }));
    };


    // Handle start time change
    const handleStartTimeChange = (time) => {
        const selectedDate = moment(formData.eventDate);
        const selectedTime = moment(time);
        const updatedStartTime = selectedDate.set({
            hour: selectedTime.hour(),
            minute: selectedTime.minute()
        }).toISOString();

        setFormData((prevFormData) => ({
            ...prevFormData,
            startTime: updatedStartTime,
            endTime: '' // Reset end time to ensure it is after start time
        }));
    };



    // Handle end time change
    const handleEndTimeChange = (time) => {
        const selectedDate = moment(formData.eventDate);
        const selectedTime = moment(time);
        const updatedEndTime = selectedDate.set({
            hour: selectedTime.hour(),
            minute: selectedTime.minute()
        }).toISOString();

        setFormData((prevFormData) => ({
            ...prevFormData,
            endTime: updatedEndTime
        }));
    };

    // const maxEndTime = formData.startTime ? new Date(new Date(formData.startTime).getTime() + 45 * 60000) : null;

    const handleDateFocus = () => {
        if (datePickerRef.current) {
            datePickerRef.current.setOpen(true);
        }
    };

    // const handleStartTimeFocus = () => {
    //     if (startTimePickerRef.current) {
    //         startTimePickerRef.current.setOpen(true);
    //     }
    // };

    // const handleEndTimeFocus = () => {
    //     if (endTimePickerRef.current) {
    //         endTimePickerRef.current.setOpen(true);
    //     }
    // };


    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
        setMainContainerClass(sidebarOpen ? 'col-md-11 ' : 'col-md-10 ');
    };


    // handle crose button
    const Navigate = useNavigate();
    const handleCros = () => {
        Navigate("/EventDashBord")
    }






    const handleinputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }))
    }

    const handleLoad = (autocompleteInstance) => {
        // console.log("autocompleteInstance", autocompleteInstance);
        setAutoComplte(autocompleteInstance);

    }

    const handlePlaceChanged = () => {
        const place = autoComplte.getPlace();
        // console.log("place", place);

        if (place.geometry) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const address = place.formatted_address;
            setFormData(prevData => ({
                ...prevData,
                latitude: lat,
                longitude: lng,
                address: address
            }))

        } else {
            toast.error("Please enter a valid address");
        }

    }


    const handleTeamSelection = (teamIds, members) => {
        setSelectedTeamds(teamIds);
        setTeamMembers(members);

        setFormData(prevData => ({
            ...prevData,
            teamIds: teamIds,
            eventMembers: Object.values(members).flat()
        }))
    }





    const hanldleCreate = async () => {
        setLoading(true);
        const url = BaseUrl();
        const storedMebers = JSON.parse(localStorage.getItem('memberId'));
        const OtherMembers = Array.isArray(storedMebers) ? storedMebers : [];

        // Format the event date and times
        const eventDateString = `${moment(formData.eventDate).format('YYYY-MM-DD')} ${moment(formData.startTime).format('h:mm A')} UTC`;
        const startTimeString = `${moment(formData.startTime).format('YYYY-MM-DD')} ${moment(formData.startTime).format('h:mm A')} UTC`;
        const endTimeString = `${moment(formData.endTime).format('YYYY-MM-DD')} ${moment(formData.endTime).format('h:mm A')} UTC`;

        // Convert to UTC and format in ISO 8601 with milliseconds and UTC timezone
        const formattedEventDateUTC = moment.utc(eventDateString, 'YYYY-MM-DD h:mm A Z').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        const formattedStartTimeUTC = moment.utc(startTimeString, 'YYYY-MM-DD h:mm A Z').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        const formattedEndTimeUTC = moment.utc(endTimeString, 'YYYY-MM-DD h:mm A Z').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');       

        const data = {
            ...formData,
            teamIds: selectedTeamds,
            eventName: formData.eventName.toLocaleUpperCase(),
            eventMembers: [...Object.values(teamMembers).flat(), ...OtherMembers],
            endTime: formattedEndTimeUTC,
            startTime: formattedStartTimeUTC,
            eventDate: formattedEventDateUTC,
            eventDateUTC: formattedEventDateUTC,
            startTimeUTC: formattedStartTimeUTC,
            endTimeUTC: formattedEndTimeUTC,
        };

        localStorage.removeItem('memberId');

        // console.log("event data", data);
        // setLoading(false);
        // return; 

        try {
            const response = await axios.post(`${url}/user/event/create`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.status === 200) {
                console.log("event created successfully", response.data);
                toast.success("Event created successfully");
                handleShowModel();
            } else {
                console.log("error in creating event", response.data);
                const errorMessage = response.data.errors ? response.data.errors.msg : 'Error logging in user';
                toast.error(errorMessage);
            }
        } catch (error) {
            console.log("error in creating event", error);
            toast.error("internal server error");
        } finally {
            setLoading(false);
        }
    };




    return (
        <div className="container-fluid   bodyColor">

            <div className="row">
                <div className="col">
                    <Sidebar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                    <SidebarSmallDevice />
                </div>

                <div className={`${mainContainerClass}  main mt-4 `}>

                    {loading ? <div className="text-center loader flex-grow-1 d-flex justify-content-center align-items-center">
                        <ThreeDots
                            height={80}
                            width={80}
                            color="green"
                            ariaLabel="loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                            visible={true}
                        />
                    </div> : null}


                    <div className=" team-dashbord">

                        <div className="d-flex">
                            <button className="btn  prev-button me-3" onClick={handleCros}><img src={arrow} alt="prevus" /></button>
                            <h3>Create Practice</h3>
                        </div>

                        <div className="dashbord-container itemsColor rounded p-3 mt-4">
                            <ToastContainer />




                            <form className="form practice-form" >
                                <div className="row">
                                    <div className="col-md-8">
                                        <label htmlFor="name">Event Name</label>
                                        <input
                                            type="text"
                                            name="eventName"
                                            placeholder="Enter name"
                                            className=" form-control"
                                            onChange={handleinputChange}
                                            value={formData.eventName}
                                        />
                                    </div>

                                    <div className="col-md-4">
                                        <label for="sportType">Sport type</label>
                                        <select name="sportId" id="sportId"
                                            onChange={handleinputChange}
                                            value={formData.sportId}
                                            required
                                            className="form-control sport-select mt-2">
                                            <option value="">Select</option>
                                            {chosenSports.map((sports, index) => (
                                                <option key={index} value={sports._id}>{sports.sports_name}</option>
                                            ))}
                                        </select>
                                    </div>

                                </div>

                                <div className="row">
                                    <div className="col-md-4 mt-2">
                                        <label htmlFor="date">Date</label>
                                        <div className="input-group date">
                                            <DatePicker
                                                selected={formData.eventDate ? new Date(formData.eventDate) : null}
                                                name="eventDate"
                                                value={formData.eventDate}
                                                onChange={handleDateChange}
                                                className="dateinput"
                                                placeholderText="Select date"
                                                onFocus={handleDateFocus}
                                                ref={datePickerRef}
                                                dateFormat={"yyyy-MM-dd"}
                                                minDate={new Date()}
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
                                                // selected={formData.startTime}
                                                selected={formData.startTime ? new Date(formData.startTime) : null}
                                                name="startTime"
                                                // value={formData.startTime}
                                                onChange={handleStartTimeChange}
                                                showTimeSelect
                                                showTimeSelectOnly
                                                timeIntervals={15}
                                                dateFormat="h:mm aa"
                                                className="form-control"
                                                placeholderText="Select start time"
                                                // onFocus={handleStartTimeFocus}
                                                // minTime={new Date()}
                                                minTime={formData.eventDate === moment().format('YYYY-MM-DD') ? new Date() : new Date().setHours(0, 0, 0, 0)}
                                                // maxTime={new Date(new Date().setHours(new Date().getHours() + 1))}
                                                maxTime={new Date().setHours(23, 59, 59)}
                                            // ref={startTimePickerRef}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-4 mt-2">
                                        <label htmlFor="endTime">End time</label>
                                        <div className="input-group">
                                            <DatePicker
                                                // selected={formData.endTime}
                                                selected={formData.endTime ? new Date(formData.endTime) : null}
                                                name="endTime"
                                                // value={formData.endTime}
                                                onChange={handleEndTimeChange}
                                                showTimeSelect
                                                showTimeSelectOnly
                                                timeIntervals={15}
                                                dateFormat="h:mm aa"
                                                className="form-control"
                                                placeholderText="Select end time"
                                                // onFocus={handleEndTimeFocus}
                                                ref={endTimePickerRef}
                                                // minTime={formData.startTime}
                                                minTime={formData.startTime ? new Date(new Date(formData.startTime).getTime() + 15 * 60000) : new Date().setHours(0, 0, 0, 0)}
                                                // maxTime={maxEndTime}
                                                maxTime={new Date().setHours(23, 59, 59)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="mt-2">
                                        <label htmlFor="Facility">Facility</label>
                                        <Autocomplete
                                            onLoad={handleLoad}
                                            onPlaceChanged={handlePlaceChanged}
                                        >
                                            <input type="search"
                                                placeholder="Search facility"
                                                className=" form-control"
                                                name="facility"
                                                onChange={handleinputChange}
                                            />
                                        </Autocomplete>
                                    </div>



                                    <div className="mt-2">
                                        <label htmlFor="note">Add notes</label>
                                        <textarea
                                            name="notes"
                                            id="notes"
                                            cols="30"
                                            rows="10"
                                            placeholder="Dear Sir/Madam, Weogram in our school. In which"
                                            className=" form-control"
                                            value={formData.notes}
                                            onChange={handleinputChange}
                                        >

                                        </textarea>
                                    </div>
                                </div>

                                <div className="mt-2 Add-member-btn">
                                    <button type="button" onClick={handleShowAddMemberAndTeam}> <i className="fa-solid fa-plus" ></i> Add Member/Team</button>
                                </div>

                                <div className="mt-5 creat-practice-btn" >
                                    <button className="btn btn-danger" type="button" onClick={hanldleCreate}>
                                        Create practice
                                    </button>
                                </div>

                            </form>


                        </div>
                        <Offcanvas show={showAddMemberAndTeam} onHide={handleCloseAddMemberAndTeam} placement="end"  >
                            <Offcanvas.Header closeButton>
                                <Offcanvas.Title>Add Member</Offcanvas.Title>
                            </Offcanvas.Header>
                            <Offcanvas.Body>
                                <AddMemberAndTeam handleCloseAddMemberAndTeam={handleCloseAddMemberAndTeam} onSelectionChange={handleTeamSelection} />
                            </Offcanvas.Body>
                        </Offcanvas>

                        <Modal show={modelShow} onHide={handleCloseModel} centered>
                            <Modal.Header closeButton
                                style={{ borderBottom: "none" }}
                            >

                            </Modal.Header>

                            <Modal.Title>
                                <div className="d-flex justify-content-center">
                                    <img src={success} alt="pic" />
                                </div>
                            </Modal.Title>
                            <Modal.Body>
                                <div className="text-center">
                                    <h3>Successful!</h3>
                                    <p className="text-muted mt-2 px-5">Event has been successfully created and
                                        Invite sent to the team members.</p>

                                    <button className="btn mt-5"
                                        style={{
                                            backgroundColor: "#D32F2F",
                                            color: "white",
                                            width: "50%"
                                        }}
                                        onClick={handleCros}
                                    >
                                        ok
                                    </button>
                                </div>

                            </Modal.Body>
                        </Modal>

                    </div>


                </div>
            </div>
        </div>
    )
}

export default CreatePracticeForm; 