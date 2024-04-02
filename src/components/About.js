import React from "react";
import "./about.css"
import DirectorPick from "./img/director.png";
import Contact from "./Contact";


const About = () => {
    return (

        <div class="About us container-fluid g-0">
            <div class="d-flex justify-content-center align-items-center about text-white">
                <h1>About us</h1>
            </div>
            <div class="container">
                <div class="row">
                    <div class="col-md-6 order-md-1 order-2 mt-5">
                        <h1 class="director-info">Abhinandan rote</h1>
                        <p class="text-muted info-profession">Director</p>
                        <p class="info-para">
                            We have a mobile application which will be a sports ecosystem. Where users can build their own teams decide who are the admins of the team. Then have a profile of every individual player where every player explains about their background in specific sports, expertise and provide expectations from team. We will also have a record of Jersey number and size of every team member. Once team is formed users can plan the events, such as practice sessions, Practice matches, and tournament matches. For every event we will have an acceptance and decline from individual team members.
                        </p>
                    </div>
                    <div class="col-md-6 order-md-2 order-1 director-pick my-5 d-flex justify-content-center">
                        <img src={DirectorPick} alt="Director pick" class="img-fluid" />
                    </div>
                </div>
            </div>

                <Contact />
        </div>

    )
}

export default About;