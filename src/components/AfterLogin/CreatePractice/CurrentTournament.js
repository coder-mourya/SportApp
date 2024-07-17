import React from "react";
import eventPick from "../../../assets/afterLogin picks/home/img.png";
import location from "../../../assets/afterLogin picks/home/location.png";
import schedule from "../../../assets/afterLogin picks/home/schedule.png";
import watch from "../../../assets/afterLogin picks/home/watch.png";
import "../../../assets/Styles/AfterLogin/practice.css";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { fetchEvents } from "../../../reducers/eventSlice";
import { useEffect } from "react";

const CurrentTournament = () => {


    const token = useSelector((state) => state.auth.user.data.user.token);
    const dispetch = useDispatch();
    const eventData = useSelector((state) => state.events.events);

    console.log("events  in current", eventData);

    useEffect(() => {
        dispetch(fetchEvents(token))
    }, [token, dispetch])


    return (
        <div className="row  d-flex   align-items-center p-md-2 ">


            {eventData.map((event, index) => {
                // const { formattedDate, formattedStartTime, formattedEndTime } = formatedDateTime(event.eventDate, event.startTime, event.endTime)

                if (event.eventType === "tournament") {

                    return (
                        <div key={index} className="col-md-6  ">
                            <div className="p-3 event-item  my-2  rounded-4 d-flex">
                                <div className="col-md-3 ">
                                    <img src={eventPick} alt="event pick" className="img-fluid eventpick" />
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
                                            <p className="mb-0">{event.eventDate}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="d-flex ">
                                            <img src={watch} alt="watch" className="me-2" />
                                            <p className="mb-0">{event.startTime} - {event.endTime}</p>
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


export default CurrentTournament;