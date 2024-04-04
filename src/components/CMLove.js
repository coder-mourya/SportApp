import React, { useState } from "react";
import "./love.css";
import "./Allfonts.css";

import left from "./img/left-arow.png"
import right from "./img/right-arow.png"
import user1 from "./img/user1.png";
import userIcon from "./img/usericon.png";
import user2 from "./img/user2.png";
import user3 from "./img/user3.png";


const Love = () => {

    const [position , setPosition]  = useState(0);
    const totalCards = 5;

    const handleLeft = () =>{
        setPosition((prevPosition) => Math.max(0, prevPosition - 1));
    }

    const handRight = () =>{
        setPosition((prevPosition) =>  Math.min(totalCards - 1, prevPosition + 1));
    }


    return (

        <div className="container-fluid mb-5">

            <div className="container my-5">


                <div className=" row d-flex justify-content-center align-items-center pt-5">

                    <div className="col-md-9 loveInfo text-start">

                        <h1 className="allFonts">
                            15k+ <strong> Customers Love</strong>
                        </h1>

                        <p className="allFonts-p">
                            Stay up-to-date with the latest matches, tournaments, and competitions across a multitude of sports. From international
                            championships to local leagues, our app ensures you never miss a moment of the action.
                        </p>
                    </div>

                    <div className="col-md-3 text-end ">

                        <button className="btn round-button mx-2" onClick={handleLeft}><img src={left} alt="left" /></button>
                        <button className="btn round-button mx-2" onClick={handRight}><img src={right} alt="right" /></button>

                    </div>

                </div>
            </div>


            <div className="container-fluid  cards-container"  style={{ transform: `translateX(${position * -100}%)` }}>

                <div className="cardsAnimat " >

                    
                        <div className="cards  ">

                            <div className="user row">

                                <div className="col-3">

                                    <img src={user2} alt="user 2" />
                                </div>

                                <div className="col-6 text-start">

                                    <h5>Andrea velle</h5>
                                    <p>Sports coach</p>
                                </div>

                                <div className="col-3">

                                    <img src={userIcon} alt="user icon" />
                                </div>

                            </div>

                            <div className="userAbout text-start">

                                <p>
                                    Creating facilities and hosting our trainings in
                                    this platfform is so much of convenient. We
                                    was alwya slooking for this. Job well done.
                                </p>

                            </div>


                        </div>
                    

                    
                        <div className="cards">

                            <div className="user row">

                                <div className="col-3">

                                    <img src={user1} alt="user 1" />
                                </div>

                                <div className="col-6 text-start">

                                    <h5>Nimra</h5>
                                    <p>Training User</p>
                                </div>

                                <div className="col-3">

                                    <img src={userIcon} alt="user icon" />
                                </div>

                            </div>

                            <div className="userAbout text-start">

                                <p>
                                    Understanding my training schedulde,
                                    tracking my progress and overall improvement
                                    areas is all at one place. Hats Off !!
                                </p>

                            </div>


                        </div>
                   

                        <div className="cards">

                            <div className="user row">

                                <div className="col-3">

                                    <img src={user3} alt="user 3" />
                                </div>

                                <div className="col-6 text-start">

                                    <h5>Elle Aasen</h5>
                                    <p>Training User</p>
                                </div>

                                <div className="col-3">

                                    <img src={userIcon} alt="user icon" />
                                </div>

                            </div>

                            <div className="userAbout text-start">

                                <p>
                                    Finding a training based on my needs was
                                    never so easy. I can see and explore all the
                                    available options at my fingerprints.
                                </p>

                            </div>


                        </div>
                   

                  
                        <div className="cards">

                            <div className="user row">

                                <div className="col-3">

                                    <img src={user1} alt="user 1" />
                                </div>

                                <div className="col-6 text-start">

                                    <h5>Nimra</h5>
                                    <p>Training User</p>
                                </div>

                                <div className="col-3">

                                    <img src={userIcon} alt="user icon" />
                                </div>

                            </div>

                            <div className="userAbout text-start">

                                <p>
                                    Understanding my training schedulde,
                                    tracking my progress and overall improvement
                                    areas is all at one place. Hats Off !!
                                </p>

                            </div>


                        </div>
                   

                   
                        <div className="cards">

                            <div className="user row">

                                <div className="col-3">

                                    <img src={user1} alt="user 1" />
                                </div>

                                <div className="col-6 text-start">

                                    <h5>Nimra</h5>
                                    <p>Training User</p>
                                </div>

                                <div className="col-3">

                                    <img src={userIcon} alt="user icon" />
                                </div>

                            </div>

                            <div className="userAbout text-start">

                                <p>
                                    Understanding my training schedulde,
                                    tracking my progress and overall improvement
                                    areas is all at one place. Hats Off !!
                                </p>

                            </div>


                        </div>
               
                </div>




            </div>

        </div>
    )
}

export default Love;
