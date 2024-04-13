import React from "react";
import event from "../../assets/afterLogin picks/home/img.png";
import location from "../../assets/afterLogin picks/home/location.png";
import schedule from "../../assets/afterLogin picks/home/schedule.png";
import watch from "../../assets/afterLogin picks/home/watch.png";
import "../../assets/Styles/AfterLogin/loggedInHome.css"

const Events = () => {
    return (
        <div className="events">

            <div className=" d-flex justify-content-between">
                <h4>Upcoming events</h4>
                <p className="viewAll">View all</p>
            </div>

            <div className="row d-flex justify-content-center mt-3 ">

                <div className="col-md-6 event-1 row itemsColor  rounded-4 ">

                    <div className="col-md-4">
                        <img src={event} alt="event pick" className="img-fluid" />
                    </div>
                    <div className="col-md-8">
                        <h4 className="mb-3">CUP-Semi final</h4>
                        <div className="mb-3">
                            <div className="d-flex align-items-center">
                                <img src={location} alt="location" className="me-2" />
                                <p className="mb-0">Somerville, New Jersey</p>
                            </div>
                        </div>
                        <div className="mb-3">
                            <div className="d-flex align-items-center">
                                <img src={schedule} alt="schedule" className="me-2" />
                                <p className="mb-0">21 Jan, 2023</p>
                            </div>
                        </div>
                        <div>
                            <div className="d-flex align-items-center">
                                <img src={watch} alt="watch" className="me-2" />
                                <p className="mb-0">8AM - 10AM</p>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="col-md-6 event-2 row itemsColor  rounded-4">
                    <div className="col-md-4">
                        <img src={event} alt="event pick" className="img-fluid" />
                    </div>
                    <div className="col-md-8">
                        <h4 className="mb-3">CUP-Semi final</h4>
                        <div className="mb-3">
                            <div className="d-flex align-items-center">
                                <img src={location} alt="location" className="me-2" />
                                <p className="mb-0">Somerville, New Jersey</p>
                            </div>
                        </div>
                        <div className="mb-3">
                            <div className="d-flex align-items-center">
                                <img src={schedule} alt="schedule" className="me-2" />
                                <p className="mb-0">21 Jan, 2023</p>
                            </div>
                        </div>
                        <div>
                            <div className="d-flex align-items-center">
                                <img src={watch} alt="watch" className="me-2" />
                                <p className="mb-0">8AM - 10AM</p>
                            </div>
                        </div>
                    </div>
                </div>


            </div>

        </div>
    )
}

export default Events;