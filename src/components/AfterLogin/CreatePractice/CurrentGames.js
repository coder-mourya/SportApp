import React, { useEffect } from "react";
import eventPick from "../../../assets/afterLogin picks/home/img.png";
import location from "../../../assets/afterLogin picks/home/location.png";
import schedule from "../../../assets/afterLogin picks/home/schedule.png";
import watch from "../../../assets/afterLogin picks/home/watch.png";
import "../../../assets/Styles/AfterLogin/practice.css";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { fetchEvents } from "../../../reducers/eventSlice";
import practice from "../../../assets/afterLogin picks/Practice/practice.svg";
import { formatDate, formatTime } from "../../Utils/dateUtils";
import { useNavigate } from "react-router-dom";



const CurrentGames = () => {

    const token = useSelector((state) => state.auth.user.data.user.token);
    const dispetch = useDispatch();
    const eventData = useSelector((state) => state.events.events);
    const Navigate = useNavigate()

    // console.log("events  in current", eventData);

    useEffect(() => {
        dispetch(fetchEvents(token))
    }, [token, dispetch])

    const handleShowDetails = (event) => {
        Navigate(`/EventDetails`, { state: { event: event } })
    }


    const Time = new Date();
    const formatedDate = Time.toISOString()
    const cuurentTime = Time.toISOString();


    const hasGames = eventData.some((event) => {
        return event.eventType === "game" && event.eventDate >= formatedDate && event.endTime >= cuurentTime;
    })

    if (!hasGames) {
        return <div className="row justify-content-center align-items-center p-5">
            <div className="col-12 text-center">
                <img src={practice} alt="team pick" className="img-fluid mb-3" />
                <p className="mb-0">You have no Games scheduled.</p>
            </div>
        </div>
    }



    return (
        <div className="row  d-flex   align-items-center p-md-2 ">


            {eventData.map((event, index) => {

                const eventFormatedDate = formatDate(event.eventDate);
                const eventEndTime = formatTime(event.endTime);
                const eventFormatedStartTime = formatTime(event.startTime);


                if (event.eventType === "game" && event.eventDate >= formatedDate && event.endTime >= cuurentTime) {

                    return (
                        <div key={index} className="col-md-6  ">
                            <div className="p-3 event-item  my-2  rounded-4 d-flex" onClick={() => handleShowDetails(event)}>
                                <div className="col-md-3 position-relative">
                                    <img src={eventPick} alt="event pick" className="img-fluid eventpick" />
                                    <img src={event.sport.selected_image} alt="event pick" className="img-fluid eventpick"
                                        style={{
                                            width: "40px",
                                            position: "absolute",
                                            top: "50%",
                                            left: "45%",
                                            transform: "translate(-50%, -50%)"

                                        }}
                                    />
                                </div>
                                <div className="col-md-9 event-icons">
                                    <h4 className="mb-2">{window.innerWidth < 576 ? event.eventName.substring(0, 10) + ".." : event.eventName}</h4>
                                    <div className="mb-2">
                                        <div className="d-flex ">
                                            <img src={location} alt="location" className="me-2 " />
                                            <p className="mb-0">
                                                {window.innerWidth <= 576 ? event.address.substring(0, 10) + "..." : event.address}

                                            </p>
                                        </div>
                                    </div>
                                    <div className="mb-2">
                                        <div className="d-flex ">
                                            <img src={schedule} alt="schedule" className="me-2 " />
                                            <p className="mb-0">{eventFormatedDate}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="d-flex ">
                                            <img src={watch} alt="watch" className="me-2" />
                                            <p className="mb-0">{eventFormatedStartTime} - {eventEndTime}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    )

                } else {
                    return null
                }


            })}
        </div>
    )
}


export default CurrentGames;