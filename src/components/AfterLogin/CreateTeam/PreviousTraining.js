import React from "react";
import training from "../../../assets/afterLogin picks/My team/training.png"
import location from "../../../assets/afterLogin picks/home/location.png";
import schedule from "../../../assets/afterLogin picks/home/schedule.png";
import watch from "../../../assets/afterLogin picks/home/watch.png";
import "../../../assets/Styles/AfterLogin/loggedInHome.css";
import star from "../../../assets/afterLogin picks/My team/star.svg";


const PreviousTraining = () => {

    // Dummy array of events
    const trainings = [
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
        // Add more events as needed
    ];


    return (
        <div className="trainings">



            <div className="row">

                {trainings.map(trainings => (
                    <div key={trainings.id} className="p-3 col-md-1 bodyColor event-item  my-3 rounded-4 d-flex ">
                        <div className="col-2">
                            <img src={training} alt="event pick" className="img-fluid" />
                        </div>
                        <div className="col-8 event-icons">
                            <h4 className="mb-2">{trainings.title}</h4>
                            <div className="mb-2">
                                <div className="d-flex ">
                                    <img src={location} alt="location" className="me-2 " />
                                    <p className="mb-0">
                                        {window.innerWidth <= 576 ? trainings.location.substring(0, 10) + "..." : trainings.location}

                                    </p>
                                </div>
                            </div>
                            <div className="mb-2">
                                <div className="d-flex ">
                                    <img src={schedule} alt="schedule" className="me-2 " />
                                    <p className="mb-0">{trainings.date}</p>
                                </div>
                            </div>
                            <div>
                                <div className="d-flex ">
                                    <img src={watch} alt="watch" className="me-2" />
                                    <p className="mb-0">{trainings.time}</p>
                                </div>
                            </div>
                        </div>


                        <div className="col-2 d-flex justify-content-center align-items-end">
                            <div className="d-flex justify-content-center rating">
                                <img src={star} alt="star" />
                                <p>4.5</p>
                            </div>
                        </div>
                    </div>

                ))}
            </div>


        </div>


    )
}

export default PreviousTraining ;