// AppScreenShots.js
import React from 'react';
import "./Allfonts.css";
import { Swiper, SwiperSlide } from 'swiper/react';
import "./Appscreenshots.css"
// Import Swiper styles
import 'swiper/css';
import "swiper/css/effect-coverflow";

import { Autoplay, EffectCoverflow, A11y } from 'swiper/modules';



import home from "./screenShots/Home.png";
import img1 from "./screenShots/img1.png";
import img2 from "./screenShots/img2.png";
import img3 from "./screenShots/img3.png";
import img4 from "./screenShots/img4.png";
import img5 from "./screenShots/img5.png";
import img6 from "./screenShots/img6.png";
import img7 from "./screenShots/img7.png";
import img8 from "./screenShots/img8.png";
import img9 from "./screenShots/img9.png";
import img10 from "./screenShots/img10.png";
import img11 from "./screenShots/img11.png";




const AppScreenShots = () => {

  const images = [home, img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11]
  const duplicates = [...images, ...images.slice(0, 5)];

  return (
    <div className="container-fluid screenshots py-5 ">



      <div className='screenShots-info text-white container my-5'>
        <h1 className='allFonts'><b>Our App </b><strong>Screenshots</strong></h1>

        <p className='allFonts-p mt-4'>Stay up-to-date with the latest matches, tournaments, and competitions across a multitude of sports. From international
          championships to local leagues, our app ensures you never miss a moment of the action.</p>
      </div>




      <div className="container swiper-container">

        <Swiper
          effect={'coverflow'}

          grabCursor={true}
          loop={true}
          spaceBetween={150}
          slidesPerView={3}


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

        >
          {duplicates.map((image, index) => (


            <SwiperSlide key={index} className={index === Math.floor(duplicates.length / 2) ? 'center-slide' : ''}>
              <img src={image} alt={`Slide ${index}`} />
            </SwiperSlide>


          ))}




        </Swiper>
      </div>

    </div>
  );
};

export default AppScreenShots;
