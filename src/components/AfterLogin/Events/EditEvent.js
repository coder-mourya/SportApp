import React from "react";
import { useState, useEffect } from "react";
import "../../../assets/Styles/AfterLogin/createTeam.css";
import "../../../assets/Styles/AfterLogin/practice.css";
import { useRef } from "react";
import date from "../../../assets/afterLogin picks/Practice/date.svg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Autocomplete } from '@react-google-maps/api';
import { toast} from "react-toastify";
import { BaseUrl } from "../../../reducers/Api/bassUrl";
import axios from "axios";
import { useSelector } from "react-redux";
import moment from 'moment';
import { formatDate } from "../../Utils/dateUtils";


const EditEvent = ({ EventDetails, handleCloseEditEvent }) => {
    const [autoComplte, setAutoComplte] = useState(null);
    const datePickerRef = useRef(null);
    const startTimePickerRef = useRef(null);
    const endTimePickerRef = useRef(null);
    const token = useSelector(state => state.auth.user.data.user.token);
    // const user = useSelector(state => state.auth.user.data.user);
    // const chosenSports = user.chosenSports;


    const [formData, setFormData] = useState({
        eventId: "",
        eventName: "",
        eventType: "",
        opponentName: "",
        sportId: "",
        latitude: "",
        longitude: "",
        address: '',
        eventDate: "",
        startTime: "",
        endTime: "",
        notes: "",

    });




    console.log("EventDetails in edit event", EventDetails);


    useEffect(() => {
        if (EventDetails) {
            const formattedDate = formatDate(EventDetails.eventDate);
            const formattedStartTime = moment(EventDetails.startTime).toDate();
            const formattedEndTime = moment(EventDetails.endTime).toDate();

            setFormData((prevFormData) => ({

                ...prevFormData,
                eventId: "",
                eventName: EventDetails?.eventName || "",
                eventType: EventDetails?.eventType || "",
                opponentName: "",
                sport: EventDetails.sport.sports_name || "",
                latitude: "",
                longitude: "",
                address: EventDetails?.address || '',
                eventDate: formattedDate || "",
                startTime: formattedStartTime || "",
                endTime: formattedEndTime || "",
                notes: EventDetails?.notes || "",

            }));


        }
    }, [EventDetails]);



    const handleDateChange = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const formatedDate = `${year}-${month}-${day}`;
        setFormData((prevFormData) => ({
            ...prevFormData,
            eventDate: formatedDate
        }))
    };

    const handleStartTimeChange = (time) => {
        // const formatedTime = time.toLocaleTimeString('en-US')
        setFormData((prevFormData) => ({
            ...prevFormData,
            startTime: time,
            endTime: ""
        }))
    };

    const handleEndTimeChange = (time) => {
        // const formatedTime = time.toLocaleTimeString('en-US')
        setFormData((prevFormData) => ({
            ...prevFormData,
            endTime: time
        }))
    };

    const maxEndTime = formData.startTime ? new Date(new Date(formData.startTime).getTime() + 30 * 60000) : null;

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






    const hanldleEdit = async () => {
        const url = BaseUrl();

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
            eventName: formData.eventName.toLocaleUpperCase(),
            endTime: formattedEndTimeUTC,
            startTime: formattedStartTimeUTC,
            eventDate: formattedEventDateUTC,
            eventDateUTC: formattedEventDateUTC,
            startTimeUTC: formattedStartTimeUTC,
            endTimeUTC: formattedEndTimeUTC,
        };

        const eventId = EventDetails._id;
        // console.log("event data", data);
        // return; 

        try {
            const response = await axios.post(`${url}/user/event/edit/${eventId}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.status === 200) {
                console.log("event created successfully", response.data);
                toast.success("Event created successfully");
                handleCloseEditEvent();


            } else {
                console.log("error in creating event", response.data);
                const errorMessage = response.data.errors ? response.data.errors.msg : 'Error logging in user';
                toast.error(errorMessage);
            }
        } catch (error) {
            console.log("error in creating event", error);
            toast.error("internal server error");
        }
    };




    return (
        <div className=" team-dashbord">
            <div className="dashbord-container itemsColor ">
               

                <form className="form practice-form" >

                    <div className="">
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

                    <div className="">
                        <label for="sportType">Sport type</label>
                        <input type="text"
                            onChange={handleinputChange}
                            value={formData.sport}
                            disabled={true}
                            style={{ cursor: "not-allowed" }}
                            className="form-control sport-select mt-2"
                        />

                    </div>

                    <div className=" mt-2">
                        <label htmlFor="date">Date</label>
                        <div className="input-group date">
                            <DatePicker
                                // selected={startDate}
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

                    <div className="row">

                        <div className="col-md-6 mt-2">
                            <label htmlFor="startTime">Start time</label>
                            <div className="input-group">
                                <DatePicker
                                    selected={formData.startTime}
                                    name="startTime"
                                    // value={formData.startTime}
                                    onChange={handleStartTimeChange}
                                    showTimeSelect
                                    showTimeSelectOnly
                                    timeIntervals={15}
                                    dateFormat="h:mm aa"
                                    className="form-control"
                                    placeholderText="Select start time"
                                    onFocus={handleStartTimeFocus}
                                    minTime={new Date()}
                                    // maxTime={new Date(new Date().setHours(new Date().getHours() + 1))}
                                    maxTime={new Date().setHours(23, 59, 59)}
                                    ref={startTimePickerRef}
                                />
                            </div>
                        </div>
                        <div className="col-md-6 mt-2">
                            <label htmlFor="endTime">End time</label>
                            <div className="input-group">
                                <DatePicker
                                    selected={formData.endTime}
                                    name="endTime"
                                    // value={formData.endTime}
                                    onChange={handleEndTimeChange}
                                    showTimeSelect
                                    showTimeSelectOnly
                                    timeIntervals={15}
                                    dateFormat="h:mm aa"
                                    className="form-control"
                                    placeholderText="Select end time"
                                    onFocus={handleEndTimeFocus}
                                    ref={endTimePickerRef}
                                    minTime={formData.startTime}
                                    maxTime={maxEndTime}
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
                                    value={formData.address}
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



                    <div className="mt-2">
                        <button className="btn btn-danger"
                            type="button"
                            onClick={hanldleEdit}
                            style={{
                                width: "100%",
                                backgroundColor: "#D32F2F",
                                color: "white"
                            }}
                        >
                            Update
                        </button>
                    </div>

                </form>


            </div>



        </div>
    )
}

export default EditEvent; 