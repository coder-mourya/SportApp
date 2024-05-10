import React from "react";
import "../assets/Styles/home.css"
import "../assets/Styles/services.css"
import "../assets/Styles/Allfonts.css";


import TeamIcon from "../assets/img/creat team.png";
import Event from "../assets/img/creat event.png";
import Coaching from "../assets/img/coaching.png";
import Booking from "../assets/img/booking.png";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";


const Services = () => {

    const {t} = useTranslation('service')


    return (


        <div className="container-fluid text-center  service-container">

            <div className="container-fluid pt-5 service-heading">

                <h1 className="pt-5 allFonts"> {t('service.heading')}<strong className="ms-1">{t('service.strong')}</strong></h1>
            </div>

            <div className="d-flex justify-content-center container">

                <p className="services allFonts-p mt-4">{t('service.peragrapgh')}</p>

            </div>



            <div className="container-fluid mt-5  d-flex justify-content-center">

                <div className="row mt-4  service-icons d-flex justify-content-center">
                    <div className="col-md-3  text-start service-box">
                        <img src={TeamIcon} alt="team icon" />
                        <h4>{t('h4')}</h4>
                        <p>{t('pera2')}</p>
                        <Link to={"/ComingSoon"} className="service-link">{t('link')} &#8594;</Link>
                    </div>

                    <div className="col-md-3  text-start service-box">
                        <img src={Event} alt="event" />
                        <h4>{t('event')}</h4>
                        <p>{t('pera3')}</p>
                        <Link to={"/ComingSoon"} className="service-link">{t('link')} &#8594;</Link>


                    </div>

                    <div className="col-md-3 text-start service-box ">
                        <img src={Coaching} alt="coaching" />
                        <h4 >{t('coach')} </h4>
                        <p>{t('pera4')}</p>
                        <Link to={"/ComingSoon"} className="service-link">{t('link')} &#8594;</Link>


                    </div>
                    <div className="col-md-3 text-start service-box">
                        <img src={Booking} alt="Booking" />
                        <h4 >{t('Booking')}</h4>
                        <p>{t('pera5')}</p>
                        <Link to={"/ComingSoon"} className="service-link">{t('link')} &#8594;</Link>


                    </div>
                </div>

            </div>
        </div>


    )
}

export default Services;