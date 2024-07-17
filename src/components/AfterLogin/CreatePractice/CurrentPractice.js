import React, { useEffect } from "react";
import eventPick from "../../../assets/afterLogin picks/home/img.png";
import location from "../../../assets/afterLogin picks/home/location.png";
import schedule from "../../../assets/afterLogin picks/home/schedule.png";
import watch from "../../../assets/afterLogin picks/home/watch.png";
import "../../../assets/Styles/AfterLogin/practice.css";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { fetchEvents } from "../../../reducers/eventSlice";

// const formatedDateTime = (eventDate, startTime, endTime) => {
//     const dateParts = eventDate.split('-');
//     const year = dateParts[0];
//     const month = dateParts[1];
//     const day = dateParts[2];

//     const date = new Date(year, month - 1, day);
//     const options = { year: "numeric", month: "long", day: "numeric" };
//     const formattedDate = date.toLocaleDateString('en-US', options);

//     // start time 

//     const startTimeParts = startTime.split(':');
//     let  hours = parseInt(startTimeParts[0], 10);
//     const minutes = startTimeParts[1];
//     const period = startTime.split(' ')[1];

//     if (period === 'pm' && hours !== '12') {
//         hours += 12;
//     } else if (period === 'am' && hours === '12') {
//         hours = '00';
//     }

//     const formattedStartTime = `${hours}:${minutes} ${period}`;

//     // end time 

//     const endTimeParts = endTime.split(':');
//     let endHours = parseInt(endTimeParts[0], 10);
//     const endMinutes = endTimeParts[1];
//     const endPeriod = endTime.split(' ')[1];

//     if (endPeriod === 'pm' && endHours !== '12') {
//         endHours += 12;
//     } else if (endPeriod === 'am' && endHours === '12') {
//         endHours = '00';
//     }

//     const formattedEndTime = `${endHours}:${endMinutes} ${endPeriod}`;
//     return `${formattedDate} ${formattedStartTime} - ${formattedEndTime}`
// }

const CurrentPractice = () => {

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
                
               if(event.eventType === "practice"){

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

               }else{
                return null
               }


            })}
        </div>
    )
}


export default CurrentPractice;