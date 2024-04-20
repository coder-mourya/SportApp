import React from "react";
import "../assets/Styles/home.css"
import "../assets/Styles/services.css"
import "../assets/Styles/Allfonts.css";


import TeamIcon from "../assets/img/creat team.png";
import Event from "../assets/img/creat event.png";
import Coaching from "../assets/img/coaching.png";
import Booking from "../assets/img/booking.png";
import { Link } from "react-router-dom"

const services = () => {
    return (


        <div className="container-fluid text-center  service-container">

            <div className="container-fluid pt-5 service-heading">

                <h1 className="pt-5 allFonts">Delivery exceptional <strong>services</strong></h1>
            </div>

            <div className="d-flex justify-content-center container">

                <p className="services allFonts-p mt-4">Welcome to our comprehensive sports platform, where we seamlessly elevate teams through streamlined management and communication tools.
                    From optimizing training sessions with effortless scheduling and performance evaluation for sports facilities, to providing tailored expense
                    management and payment solutions for sporting communities, we're dedicated to enhancing every aspect of your sporting journey</p>

            </div>



            <div className="container-fluid mt-5  d-flex justify-content-center">

                <div className="row mt-4  service-icons d-flex justify-content-center">
                    <div className="col-md-3  text-start service-box">
                        <img src={TeamIcon} alt="team icon" />
                        <h4>create team</h4>
                        <p>Then have a profile of every indivdual player where every player explains.</p>
                        <Link to={"/ComingSoon"} className="service-link">Get started &#8594;</Link>
                    </div>

                    <div className="col-md-3  text-start service-box">
                        <img src={Event} alt="event" />
                        <h4>Create event</h4>
                        <p>Then have a profile of every indivdual player where every player explains.</p>
                        <Link to={"/ComingSoon"} className="service-link">Get started &#8594;</Link>


                    </div>

                    <div className="col-md-3 text-start service-box ">
                        <img src={Coaching} alt="coaching" />
                        <h4 >Coaching & training  </h4>
                        <p>Then have a profile of every indivdual player where every player explains.</p>
                        <Link to={"/ComingSoon"} className="service-link">Get started &#8594;</Link>


                    </div>
                    <div className="col-md-3 text-start service-box">
                        <img src={Booking} alt="Booking" />
                        <h4 >Booking</h4>
                        <p>Then have a profile of every indivdual player where every player explains.</p>
                        <Link to={"/ComingSoon"} className="service-link">Get started &#8594;</Link>


                    </div>
                </div>

            </div>
        </div>


    )
}

export default services;