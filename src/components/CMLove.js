import React from "react";
import { useRef } from "react";
import { useState, useEffect } from "react";
import "../assets/Styles/Cmlove.css";
import "../assets/Styles/Allfonts.css";


import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';

import left from "../assets/img/left-arow.png"
import right from "../assets/img/right-arow.png"
import userIcon from "../assets/img/usericon.png";
// import user1 from "../assets/img/user1.png";
// import user2 from "../assets/img/user2.png";
// import user3 from "../assets/img/user3.png";
import { Reviews } from "../assets/DummyData/dummyData";


const Love = () => {

    const [data, setData] = useState([]);
    const owlCarouselRef = useRef(null);



    useEffect(() => {



        const fetchData = async () => {
            try {


                setData(Reviews);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();

    }, []);

    //user images 
    // const userImages = [user1, user2, user3];


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


    const sliceDescription = (description) => {
        const maxLength = 80; // Maximum length of sliced description
        if (description.length > maxLength) {
            return `${description.slice(0, maxLength)}...`; // Slice the description if it's longer than maxLength
        }
        return description; // Return the original description if it's within maxLength
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

                    <div className="col-md-3 text-end  ">

                        <button className="btn round-button mx-2" onClick={handleNextButtonClick}><img src={left} alt="left" /></button>
                        <button className="btn round-button mx-2" onClick={handlePrevButtonClick} ><img src={right} alt="right" /></button>

                    </div>

                </div>
            </div>


            <div className="container-fluid  cards-container" >

                <div className="cardsAnimat" >


                    {data.length > 0 && (
                        <OwlCarousel className='owl-theme'
                            items={3}
                            loop
                            autoplay={true}
                            autoplayTimeout={2000}
                            smartSpeed={2000}
                            margin={10}
                            center={true}
                            responsive={breakpoints}
                            ref={owlCarouselRef}
                            dots={false}
                        >
                            {data.map((item, index) => (
                                <div key={index} className="cards chCards item ">
                                    <div className="user row">
                                        <div className="col-3">
                                            <img src={item.image} alt={item.name} className="card-pick" />
                                        </div>
                                        <div className="col-6 text-start">
                                            <h5>{item.name}</h5>
                                            <p className="text-muted">{item.role}</p>
                                        </div>
                                        <div className="col-3">
                                            <img src={userIcon} alt="user icon" />
                                        </div>
                                    </div>
                                    <div className="userAbout text-start">
                                    <p>{sliceDescription(item.description)}</p>
                                    </div>
                                </div>
                            ))}
                        </OwlCarousel>
                    )}

                </div>




            </div>

        </div>
    )
}

export default Love;
