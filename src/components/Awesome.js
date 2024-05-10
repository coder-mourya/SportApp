import React from "react";
import "../assets/Styles/awesome.css";
import "../assets/Styles/Allfonts.css";


import Video from "../assets/img/video.mp4"
import Team from "../assets/img/team.png"
import Player from "../assets/img/player.png";
import Training from "../assets/img/training.png";
import Attendance from "../assets/img/attendance.png";
import Feedback from "../assets/img/rating.png";
import Security from "../assets/img/security.png";

import { useTranslation } from "react-i18next";

const Awesome = () => {

    const {t} = useTranslation('Awesome')
    return (

        <div className="Awesome-feature container-fluid ">

            <div className="video-background">

                <video autoPlay muted loop className="video">
                    <source src={Video} type="video/mp4" />
                </video>

            </div>





            <div className="contant  mt-5 ">
                <div>
                    <h1 className="allFonts"><b>{t('awesome.heading')}</b> <strong>{t('awesome.strong')}</strong></h1>

                </div>
                <div className=" d-flex justify-content-center">

                    <p className="mt-4 allFonts-p">{t('awesome.peragrapgh')}</p>
                </div>
            </div>





            <div className="container-fluid ">

                <div className="row d-flex justify-content-center ">

                    <div className="team-building text-start cards col-md-2   my-2 row">

                        <div className="col-md-3">

                            <img src={Team} alt="team building" className="card-pick" />
                        </div>

                        <div className="col-md-9">

                            <h5>{t('Team')}</h5>
                            <p>
                            {t('pera1')}
                            </p>
                        </div>
                    </div>

                    <div className="Player Profiles text-start cards col-md-2  my-2 row">

                        <div className="col-md-3">

                            <img src={Player} alt="player" className="card-pick" />
                        </div>
                        <div className="col-md-9">

                            <h5>{t('Player')}</h5>
                            <p>
                            {t('pera2')}
                            </p>
                        </div>

                    </div>



                    <div className="Training Listings text-start cards col-md-2  my-2 row">

                        <div className="col-md-3">

                            <img src={Training} alt="training" className="card-pick" />
                        </div>

                        <div className="col-md-9">

                            <h5> {t('Training')}</h5>
                            <p>
                            {t('pera3')}
                            </p>
                        </div>
                    </div>




                    <div className="Attendance Tracking text-start cards col-md-2  my-2 row">
                        <div className="col-md-3">

                            <img src={Attendance} alt="attendance " className="card-pick" />
                        </div>

                        <div className="col-md-9">

                            <h5>{t('Attendance')}</h5>
                            <p>
                            {t('pera4')}
                            </p>
                        </div>
                    </div>

                    <div className="Feedback and Ratings text-start cards col-md-2  my-2 row">
                        <div className="col-md-3">

                            <img src={Feedback} alt=" feedback" className="card-pick" />
                        </div>

                        <div className="col-md-9">

                            <h5>{t('Feedback')}</h5>
                            <p>
                            {t('pera5')}
                            </p>
                        </div>

                    </div>


                    <div className="Security and Privacy text-start cards col-md-2  my-2 row">
                        <div className="col-md-3">

                            <img src={Security} alt="Security" className="card-pick" />
                        </div>
                        <div className="col-md-9">

                            <h5>{t('Security')}</h5>
                            <p>{t('pera6')}</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>

    )
}


export default Awesome;