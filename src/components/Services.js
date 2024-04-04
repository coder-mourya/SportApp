import React from "react";
import "../pages/style.css"
import "./services.css"
import "./Allfonts.css";

import TeamIcon from "./img/creat team.png";
import Event from "./img/creat event.png";
import Coaching from "./img/coaching.png";
import Booking from "./img/booking.png";
import {Link }from "react-router-dom"

const services = () => {
    return (


        <div className="container-fluid text-center  service-container">

            <div className="container pt-5 service-heading">

                <h1 className="pt-5 allFonts">Delivery exceptional <strong>services</strong></h1>
            </div>

            <div className="d-flex justify-content-center container">

                <p className="services allFonts-p">We have a mobile application which will be a sports acu system. Where users can build their  teams decide whoare the admins of the team. Then have a profile of every individual player where every player explaine about their background in specific sports, expertise and provide expectatione from team.</p>

            </div>



            <div className="container-fluid mt-5  d-flex justify-content-center">

                <div className="row mt-4  service-icons d-flex justify-content-center">
                    <div className="col-md-3  text-start service-box">
                        <img src={TeamIcon} alt="team icon" />
                        <h4>create team</h4>
                        <p>Then have a profile of every indivdual player where every player explains.</p>
                        <Link to={"#"} className="service-link">Get started &#8594;</Link>
                    </div>

                    <div className="col-md-3  text-start service-box">
                        <img src={Event} alt="event" />
                        <h4>Create event</h4>
                        <p>Then have a profile of every indivdual player where every player explains.</p>
                        <Link to={"#"} className="service-link">Get started &#8594;</Link>


                    </div>

                    <div className="col-md-3 text-start service-box ">
                        <img src={Coaching} alt="coaching" />
                        <h4 >Coaching & training  </h4>
                        <p>Then have a profile of every indivdual player where every player explains.</p>
                        <Link to={"#"} className="service-link">Get started &#8594;</Link>


                    </div>
                    <div className="col-md-3 text-start service-box">
                        <img src={Booking} alt="Booking" />
                        <h4 >Booking</h4>
                        <p>Then have a profile of every indivdual player where every player explains.</p>
                        <Link to={"#"} className="service-link">Get started &#8594;</Link>


                    </div>
                </div>

            </div>
        </div>


    )
}

export default services;