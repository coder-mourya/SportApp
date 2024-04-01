import React from "react";
import "./style.css";
import "./animation.css";
import sidePick from "./img/sidepick.png";
import RightSideImg from "./img/right-side.png";
import playStore from "./img/play store.png";
import appStore from "./img/app store.png";
import Player1 from "./img/player 1.png";
import Player2 from "./img/player 2.png";
import Player3 from "./img/player 3.png";
import Player4 from "./img/player 4.png";
import Ball from "./img/ball.png";
import Services from "../components/Services";
import FAQ from "../components/FAQ";
import Awesome from "../components/Awesome";
import Feedback from "../components/Feedback";
import Contact from "../components/Contact";
import Love from "../components/CMLove";
import AppScreenShots from "../components/AppScreenShots"





const Home = () => {





    return (



        <div className="container-fluid g-0 text-center  ">

            <section className="Player-picks container  mb-5">


                <h1 className="mt-5 Home-heading text-animation1"><b>Empowering Athletes, Uniting</b> <strong>Champions</strong></h1>


                <div className="container-fluid d-flex justify-content-center row">

                    <div className="col-md-2 ">

                        <img src={sidePick} alt="sidepick" className="side-icons animation1" />
                    </div>



                    <div className="mt-3 col-md-8">

                        <p className="mt-2  custm-pera text-center my-4 text-animation2">Unleash your potential, celebrate victories, and connect with a community that shares your sporting passion on SportsNerve. Your journey to excellence starts here</p>

                        <div className="applinkMargin">

                            <a href="https://play.google.com/store/apps/details?id=com.sportsnerve.usersapp&pcampaignid=web_share" target="_blank" rel="noopener noreferrer" className="mx-2  links"><img src={playStore} alt="play store pick" className="mt-2 app-links" /></a>

                            <a href="https://apps.apple.com/us/app/sports-nerve/id6468219398" target="_blank" rel="noopener noreferrer" className="mx-2 links"><img src={appStore} alt="app-Store-pick" className="mt-2 app-links" /></a>

                        </div>

                    </div>

                    <div className="col-md-2">

                        <img src={RightSideImg} alt="right-sidePick" className="side-icons animation2" />
                    </div>

                </div>




                <div className="player-list">

                    <ul>
                        <li><img src={Player1} alt="player 1 " className="player-padding player1" /></li>
                        <li><img src={Player2} alt="player 2" className="player2" /></li>

                        <li><img src={Ball} alt="ball" className="ball" /></li>

                        <li><img src={Player3} alt="player 3" className="player3" /></li>
                        <li><img src={Player4} alt="Player 4" className=" player-padding player4" /></li>

                    </ul>
                </div>
            </section>



            <section >
                <Services />

            </section>

            <section>
                <Awesome />
            </section>

            <section>

                <AppScreenShots />
            </section>

            <section>
                <Love />
            </section>


            <section>
                <Feedback />
            </section>


            <section>
                <FAQ />
            </section>

            <section>
                <Contact />
            </section>



        </div>

    )
}

export default Home;
