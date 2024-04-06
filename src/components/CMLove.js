import React from "react";
import { useRef } from "react";
import "../assets/Styles/Cmlove.css";
import "../assets/Styles/Allfonts.css";


import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';

import left from  "../assets/img/left-arow.png"
import right from "../assets/img/right-arow.png"
import user1 from "../assets/img/user1.png";
import userIcon from"../assets/img/usericon.png";
import user2 from "../assets/img/user2.png";
import user3 from "../assets/img/user3.png";


const Love = () => {

    const owlCarouselRef = useRef(null);
    const breakpoints = {

        0: {
            items: 1 // On small screens (phones), show 1 item
          },
         
          600: {
            items: 2 // On laptops, show 3 items
          },
          1200: {
            items: 3 // On larger screens, show 4 items
          }

       

    }


    const handleNextButtonClick = () => {
        if (owlCarouselRef && owlCarouselRef.current) {
          owlCarouselRef.current.next();
        }
      };
    
      const handlePrevButtonClick = () => {
        if (owlCarouselRef && owlCarouselRef.current) {
          owlCarouselRef.current.prev();
        }
      };



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

                        <button className="btn round-button mx-2" onClick={handleNextButtonClick}><img src={left} alt="left" /></button>
                        <button className="btn round-button mx-2" onClick={handlePrevButtonClick} ><img src={right} alt="right" /></button>

                    </div>

                </div>
            </div>


            <div className="container-fluid  cards-container" >

                <div className="cardsAnimat" >

                    <OwlCarousel className='owl-theme'
                        items={3}
                        loop
                        autoplay={true}
                        autoplayTimeout={2000}
                        smartSpeed={2000}
                        margin={10}
                        center={true}
                        responsive={breakpoints}
                        

                        dots={false}
                        ref={owlCarouselRef}
                    >



                        <div className="cards  item ">

                            <div className="user row">

                                <div className="col-3">

                                    <img src={user2} alt="user 2" className=" img-fluid" />
                                </div>

                                <div className="col-6 text-start">

                                    <h5>Andrea velle</h5>
                                    <p>Sports coach</p>
                                </div>

                                <div className="col-3">

                                    <img src={userIcon} alt="user icon" className=" img-fluid" />
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



                        <div className="cards item">

                            <div className="user row">

                                <div className="col-3">

                                    <img src={user1} alt="user 1"  className=" img-fluid"/>
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


                        <div className="cards item">

                            <div className="user row">

                                <div className="col-3">

                                    <img src={user3} alt="user 3"  className=" img-fluid"/>
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



                        <div className="cards item">

                            <div className="user row">

                                <div className="col-3">

                                    <img src={user1} alt="user 1"  className=" img-fluid"/>
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



                        <div className="cards item">

                            <div className="user row">

                                <div className="col-3">

                                    <img src={user1} alt="user 1"  className=" img-fluid"/>
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
                    </OwlCarousel>
                </div>




            </div>

        </div>
    )
}

export default Love;
