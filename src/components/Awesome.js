import React from "react";
import "../assets/Styles/awesome.css";
import "../assets/Styles/Allfonts.css";


import Video from "../assets/img/video.mp4"
import Team from "../assets/img/team.png"
import Player from "../assets/img/player.png";
import Training from "../assets/img/training.png";
import Attendance from "../assets/img/attendance.png";
import Feedback from "../assets/img/rating.png";
import Security from "../assets/img/security.png"

const Awesome = () => {
    return (

        <div className="Awesome-feature container-fluid ">

            <div className="video-background">

                <video autoPlay muted loop className="video">
                    <source src={Video} type="video/mp4" />
                </video>

            </div>





            <div className="contant  mt-5 ">
                <div>
                    <h1 className="allFonts"><b>More awesome</b> <strong>feature</strong></h1>

                </div>
                <div className=" d-flex justify-content-center">

                    <p className="mt-4 allFonts-p">Immerse yourself in the SportsNerve ecosystem, where flawless event coordination and personalized training empower your journey. Discover unity, pursue excellence, and embrace triumph within the realm of sports.</p>
                </div>
            </div>





            <div className="container-fluid ">

                <div className="row d-flex justify-content-center ">

                    <div className="team-building text-start cards col-md-2   my-2 row">

                        <div className="col-md-3">

                            <img src={Team} alt="team building" className="card-pick" />
                        </div>

                        <div className="col-md-9">

                            <h5>Team Building</h5>
                            <p>Create and manage sports teams
                                with customizable roles and
                                administrators.</p>
                        </div>
                    </div>

                    <div className="Player Profiles text-start cards col-md-2  my-2 row">

                        <div className="col-md-3">

                            <img src={Player} alt="player" className="card-pick" />
                        </div>
                        <div className="col-md-9">

                            <h5>Player Profiles</h5>
                            <p>
                                Detailed profiles showcasing player
                                backgrounds, expertise, and
                                expectations.
                            </p>
                        </div>

                    </div>



                    <div className="Training Listings text-start cards col-md-2  my-2 row">

                        <div className="col-md-3">

                            <img src={Training} alt="training" className="card-pick" />
                        </div>

                        <div className="col-md-9">

                            <h5>Training Listings</h5>
                            <p>
                                Discover tailored training sessions
                                based on skill and location.
                            </p>
                        </div>
                    </div>




                    <div className="Attendance Tracking text-start cards col-md-2  my-2 row">
                        <div className="col-md-3">

                            <img src={Attendance} alt="attendance " className="card-pick" />
                        </div>

                        <div className="col-md-9">

                            <h5>Attendance Tracking</h5>
                            <p>
                                Effortless attendance tracking with
                                QR codes, fostering commitment.
                            </p>
                        </div>
                    </div>

                    <div className="Feedback and Ratings text-start cards col-md-2  my-2 row">
                        <div className="col-md-3">

                            <img src={Feedback} alt=" feedback" className="card-pick" />
                        </div>

                        <div className="col-md-9">

                            <h5>Feedback and Ratings</h5>
                            <p>
                                Coaches provide personalized
                                feedback, users rate sessions.
                            </p>
                        </div>

                    </div>


                    <div className="Security and Privacy text-start cards col-md-2  my-2 row">
                        <div className="col-md-3">

                            <img src={Security} alt="Security" className="card-pick" />
                        </div>
                        <div className="col-md-9">

                            <h5>Security and Privacy</h5>
                            <p>Robust data security through
                                authentication and protection
                                measures.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>

    )
}


export default Awesome;