import React from "react";
import training from "../../../assets/afterLogin picks/My team/training.png"
import location from "../../../assets/afterLogin picks/home/location.png";
import schedule from "../../../assets/afterLogin picks/home/schedule.png";
import watch from "../../../assets/afterLogin picks/home/watch.png";
import "../../../assets/Styles/AfterLogin/loggedInHome.css";
import star from "../../../assets/afterLogin picks/My team/star.svg";
import trainingPick from "../../../assets/afterLogin picks/My team/trainings.svg";


const CurrentTraining = () => {

    // Dummy array of events
    const trainings = [
        // {
        //     id: 1,
        //     title: 'CUP-Semi final',
        //     location: 'Somerville, New Jersey',
        //     date: '21 Jan, 2023',
        //     time: '8AM - 10AM'
        // },
        // {
        //     id: 2,
        //     title: 'CUP-Final',
        //     location: 'New York City, New York',
        //     date: '28 Jan, 2023',
        //     time: '10AM - 12PM'
        // },
        // Add more events as needed
    ];


    return (
        <div className="trainings">

            <div className="row">

                {trainings.length === 0 ? (
                      <div className="row justify-content-center align-items-center p-5">
                      <div className="col-12 d-flex justify-content-center align-items-center mb-3">
                          <img src={trainingPick} alt="member pick" className="img-fluid" />
                      </div>
                      <div className="col-12 text-center">
                      <p className="text-center">There are no trainings available.</p>
                      </div>
                  </div>
                ) : (
                    trainings.map(training => (
                        <div key={training.id} className="p-3 col-md-1 bodyColor event-item my-3 rounded-4 d-flex ">
                            <div className="col-2">
                                <img src={training.image} alt="event pick" className="img-fluid" />
                            </div>
                            <div className="col-8 event-icons">
                                <h4 className="mb-2">{training.title}</h4>
                                <div className="mb-2">
                                    <div className="d-flex ">
                                        <img src={location} alt="location" className="me-2 " />
                                        <p className="mb-0">
                                            {window.innerWidth <= 576 ? training.location.substring(0, 10) + "..." : training.location}
                                        </p>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <div className="d-flex ">
                                        <img src={schedule} alt="schedule" className="me-2 " />
                                        <p className="mb-0">{training.date}</p>
                                    </div>
                                </div>
                                <div>
                                    <div className="d-flex ">
                                        <img src={watch} alt="watch" className="me-2" />
                                        <p className="mb-0">{training.time}</p>
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
                    ))
                )}

            </div>


        </div>


    )
}

export default CurrentTraining