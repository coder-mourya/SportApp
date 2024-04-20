import React from "react";
import "../assets/Styles/feedback.css";
import "../assets/Styles/Allfonts.css";


import playStore from "../pages/img/app store.png";
import appStore from "../pages/img/play store.png";
import AppPick from '../assets/img/app.png';

const Feedback = () => {
    return (

        <div className="feedback row g-0">

            <div className="col-md-6  d-flex  align-items-center">
                <div className=" feedback-link">


                    <h1 className="allFonts text-start"><b>Expert Insights,</b> <br />
                        <strong>Personal Feedback</strong></h1>



                    <p className="allFonts-p mt-3 text-start">Get coach feedback, rate sessons and progress on  your sports journey.</p>




                    <div className="d-flex justify-content-md-start justify-content-between">

                    <a href="https://play.google.com/store/apps/details?id=com.sportsnerve.usersapp&pcampaignid=web_share" target="_blank" rel="noopener noreferrer" className="links"><img src={playStore} alt="play store pick" className="mt-3 app-links" /></a>

                    <a href="https://apps.apple.com/us/app/sports-nerve/id6468219398" target="_blank" rel="noopener noreferrer" className="mx-md-2 links"><img src={appStore} alt="app-Store-pick" className="mt-3 app-links" /></a>

                    </div>

                </div>
            </div>

            <div className="col-md-6">
                <img src={AppPick} alt="app download" className="download-app" />
            </div>
        </div>
    )

}

export default Feedback;