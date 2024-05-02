import React from "react";
import eventPick from "../../../assets/afterLogin picks/home/img.png";
import location from "../../../assets/afterLogin picks/home/location.png";
import schedule from "../../../assets/afterLogin picks/home/schedule.png";
import watch from "../../../assets/afterLogin picks/home/watch.png";
import "../../../assets/Styles/AfterLogin/practice.css";

const CurrentPractice = () => {

    const eventData = [
        {
            id: 1,
            title: 'CUP-Semi final',
            location: 'Somerville, New Jersey',
            date: '21 Jan, 2023',
            time: '8AM - 10AM'
        },
        {
            id: 2,
            title: 'CUP-Final',
            location: 'New York City, New York',
            date: '28 Jan, 2023',
            time: '10AM - 12PM'
        },

        {
            id: 3,
            title: 'CUP-Semi final',
            location: 'Somerville, New Jersey',
            date: '21 Jan, 2023',
            time: '8AM - 10AM'
        },
        {
            id: 4,
            title: 'CUP-Final',
            location: 'New York City, New York',
            date: '28 Jan, 2023',
            time: '10AM - 12PM'
        },
        // Add more events as needed
    ];

    return (
        <div className="row  d-flex   align-items-center p-md-2 ">


            {eventData.map(event => (
                <div key={event.id} className="col-md-6  ">
                    <div className="p-3 event-item  my-2  rounded-4 d-flex">
                        <div className="col-md-3 ">
                            <img src={eventPick} alt="event pick" className="img-fluid eventpick" />
                        </div>
                        <div className="col-md-9 event-icons">
                            <h4 className="mb-2">{window.innerWidth < 576 ? event.title.substring(0, 10) + ".." : event.title}</h4>
                            <div className="mb-2">
                                <div className="d-flex ">
                                    <img src={location} alt="location" className="me-2 " />
                                    <p className="mb-0">
                                        {window.innerWidth <= 576 ? event.location.substring(0, 10) + "..." : event.location}

                                    </p>
                                </div>
                            </div>
                            <div className="mb-2">
                                <div className="d-flex ">
                                    <img src={schedule} alt="schedule" className="me-2 " />
                                    <p className="mb-0">{event.date}</p>
                                </div>
                            </div>
                            <div>
                                <div className="d-flex ">
                                    <img src={watch} alt="watch" className="me-2" />
                                    <p className="mb-0">{event.time}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            ))}
        </div>
    )
}


export default CurrentPractice;