import React from "react";
import schedule from "../../../assets/afterLogin picks/home/schedule.png";
import eventPick from "../../../assets/afterLogin picks/home/img.png";
import location from "../../../assets/afterLogin picks/home/location.png";
import watch from "../../../assets/afterLogin picks/home/watch.png";
import { formatDate, formatTime } from "../../Utils/dateUtils";
import { useNavigate } from "react-router-dom";
import sportPic from "../../../assets/afterLogin picks/My team/team.svg";

const EventSchedule = ({eventData}) => {
    const Navigate = useNavigate();

    const handleEVentClick = (event) => {
        // console.log("event id coming ", event);        
        Navigate("/EventDetails", { state: { event: event } });
    }


    return (
        <div className="row">
            {eventData.length > 0 ? (
                eventData.map((eventWrapper, index) => {
                    const event = eventWrapper.event || eventWrapper; // Check if `event` is nested or directly available
                    const eventFormatedDate = formatDate(event.eventDate || event.event.eventDate);
                    const eventEndTime = formatTime(event.endTime || event.event.endTime);
                    const eventFormatedStartTime = formatTime(event.startTime || event.event.startTime);

                    return (
                        <div className="col-md-6 col-sm-12 my-2" key={index}>
                            <div
                                className="p-3 rounded-4 row mx-1"
                                style={{
                                    border: eventWrapper.requestStatus === 1 ? "0.6px dotted red" : "none",
                                    backgroundColor: eventWrapper.requestStatus === 1 ? "#FDF4F4" : "#F4F5F9",
                                    cursor: "pointer",
                                }}
                                onClick={() => handleEVentClick(eventWrapper)}
                            >
                                <div className="col-md-3 position-relative p-0 d-flex align-content-center">
                                    <img src={eventPick} alt="event pick" className="img-fluid eventpick" />
                                    <img
                                        src={event?.sport?.selected_image || eventWrapper.event.sport.map((sport) => sport.selected_image)}
                                        alt="sport pick"
                                        className="img-fluid eventpick"
                                        style={{
                                            width: "35px",
                                            position: "absolute",
                                            top: "50%",
                                            left: "52%",
                                            transform: "translate(-50%, -50%)",
                                        }}
                                    />
                                </div>
                                <div className="col-md-9">
                                    <h4 className="mb-2">
                                        {window.innerWidth < 576
                                            ? (event.eventName || event.event.eventName).substring(0, 10) + ".."
                                            : event.eventName || event.event.eventName}
                                    </h4>
                                    <div className="mb-2">
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={location}
                                                alt="location"
                                                className="me-2"
                                                style={{ width: "20px", height: "20px" }}
                                            />
                                            <p className="mb-0">
                                                {(window.innerWidth > 20
                                                    ? (event.address || event.event.address).substring(0, 25) + "..."
                                                    : event.address || event.event.address) || "No Address Available"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mb-2">
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={schedule}
                                                alt="schedule"
                                                className="me-2"
                                                style={{ width: "20px", height: "20px" }}
                                            />
                                            <p className="mb-0">{eventFormatedDate}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={watch}
                                                alt="watch"
                                                className="me-2"
                                                style={{ width: "20px", height: "20px" }}
                                            />
                                            <p className="mb-0">
                                                {eventFormatedStartTime} - {eventEndTime}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="row justify-content-center align-items-center p-5">
                    <div className="col-12 text-center">
                        <img src={sportPic} alt="team pick" className="img-fluid mb-3" />
                        <p className="mb-0">You have no event or training yet</p>
                    </div>
                </div>
            )}
        </div>
    )
};

export default EventSchedule;