// AppScreenShots.js
import React from 'react';
import "../assets/Styles/Allfonts.css";

import { Swiper, SwiperSlide } from 'swiper/react';
import "../assets/Styles/Appscreenshots.css"
// Import Swiper styles
import 'swiper/css';
import "swiper/css/effect-coverflow";

import { Autoplay, EffectCoverflow, A11y } from 'swiper/modules';



import home from "../assets/screenShots/Home.png";
import img1 from "../assets/screenShots/img1.png";
import img2 from "../assets/screenShots/img2.png";
import img3 from "../assets/screenShots/img3.png";
import img4 from "../assets/screenShots/img4.png";
import img5 from "../assets/screenShots/img5.png";
import img6 from "../assets/screenShots/img6.png";
import img7 from "../assets/screenShots/img7.png";
import img8 from "../assets/screenShots/img8.png";
import img9 from "../assets/screenShots/img9.png";
import img10 from"../assets/screenShots/img10.png";
import img11 from"../assets/screenShots/img11.png";


//import coverImage from "./screenShots/Device.png"



const AppScreenShots = () => {

  const images = [home, img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11]
  const duplicates = [...images];


  const breakpoints = {
    // when window width is >= 992px (large devices), show 3 images per view
    992: {
      slidesPerView: 3
    },
    // when window width is >= 768px (medium devices) and < 992px, show 2 images per view
    768: {
      slidesPerView: 2
    },
    // when window width is < 768px (small devices), show 1 image per view
    0: {
      slidesPerView: 1
    }
  };



  return (
    <div className="container-fluid screenshots py-5 ">



      <div className='screenShots-info text-white container my-5'>
        <h1 className='allFonts'><b>Our App </b><strong>Screenshots</strong></h1>

        <p className='allFonts-p mt-4'>Stay up-to-date with the latest matches, tournaments, and competitions across a multitude of sports. From international
          championships to local leagues, our app ensures you never miss a moment of the action.</p>
      </div>




      <div className='cover'>
{/*
        <div className=' d-flex justify-content-center align-content-center align-items-center'>

          <img src={coverImage} alt="cover img" className='backgoundImg' />
        </div>*/}


        <div className="container swiper-container">

          <Swiper
            effect={'coverflow'}

            grabCursor={true}
            loop={true}
            spaceBetween={150}



            autoplay={{
              delay: 5000,
              disableOnInteraction: false
            }}

            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 100,
              modifier: 3,
            }}

            modules={[Autoplay, A11y, EffectCoverflow]}
            className="mySwiper"
            breakpoints={breakpoints}


          >
            {duplicates.map((image, index) => (


              <SwiperSlide id='centerImg' key={index} className={index === Math.floor(duplicates.length / 2) ? 'center-slide' : ''}>

                <img src={image} alt={`Slide ${index}`} />
              </SwiperSlide>


            ))}




          </Swiper>
        </div>
      </div>

    </div>
  );
};

export default AppScreenShots;
