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
import practice from "../../../assets/afterLogin picks/Practice/practice.svg";
import { formatDate, formatTime } from "../../Utils/dateUtils";


const PrevTournament = () => {


    const token = useSelector((state) => state.auth.user.data.user.token);
    const dispetch = useDispatch();
    const eventData = useSelector((state) => state.events.events);

    // console.log("events  in current", eventData);

    useEffect(() => {
        dispetch(fetchEvents(token))
    }, [token, dispetch])

    function getCurrentISODateTime() {
        const now = new Date();
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}T${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}Z`;
    }

    const cuurentTime = getCurrentISODateTime();
    // const formatedDate = getCurrentISODateTime();

    const hasPrevTournament = eventData.some((event) => {
        return event.eventType === "tournament"
            && event.endTime > cuurentTime
        //   && event.eventDate < formatedDate;
    })

    if (!hasPrevTournament) {
        return <div className="row justify-content-center align-items-center p-5">
            <div className="col-12 text-center">
                <img src={practice} alt="team pick" className="img-fluid mb-3" />
                <p className="mb-0">You have no practice scheduled.</p>
            </div>
        </div>
    }


    return (
        <div className="row  d-flex   align-items-start p-md-2 "
            style={{
                height: "33rem",
                overflowY: "auto",
                scrollbarWidth: "none",
                msOverflowStyle: "none"
            }}
        >

            {eventData.map((event, index) => {
                const eventFormatedDate = formatDate(event.eventDate);
                const eventEndTime = formatTime(event?.endTime, event?.location?.coordinates[1], event?.location?.coordinates[0]);
                const eventFormatedStartTime = formatTime(event?.startTime, event?.location?.coordinates[1], event?.location?.coordinates[0]);

                if (event.eventType === "tournament"
                    && event.endTime > cuurentTime
                    //   && event.eventDate < formatedDate
                ) {

                    return (
                        <div key={index} className="col-md-6  ">
                            <div className="p-3 event-item  my-2  rounded-4 d-flex">
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
                                                {window.innerWidth <= 576
                                                    ? (event.address.length > 10
                                                        ? event.address.substring(0, 10) + "..."
                                                        : event.address)
                                                    : (event.address.length > 50
                                                        ? event.address.substring(0, 50) + "..."
                                                        : event.address)}

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


export default PrevTournament;