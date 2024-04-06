import React from "react";
import logo from  "../assets/img/footerLogo.png";
import Home from  "../assets/img/home.png";
import phone from "../assets/img/phone.png";
import mail from  "../assets/img/mail.png";
import "../assets/Styles/Allfonts.css";
import "../assets/Styles/footer.css"
import { Link } from "react-router-dom"
import playStore from '../pages/img/play store.png'
import appStore from "../pages/img/app store.png"


const Footer = () => {

    return (
        <div className="container-fluid footer g-0">

            <div className=" d-flex justify-content-center">

                <div className="row container-fluid">

                    <div className="col-md-4 info mt-3">
                        <ul>
                            <li id="logo"><img src={logo} alt="footer logo" /><span>Sportsnerve</span></li>
                            <li><img src={Home} alt="home" /><span> 11-03 PLQ 1, Paya Lebar Quarter
                            </span>
                                <p className="cutm-address">Singapore 408533</p>
                            </li>
                            <li><img src={mail} alt="mail" /><span>info@sportsnerve.com</span></li>
                            <li><img src={phone} alt="phone" /><span>+65 7979797972</span></li>

                        </ul>
                    </div>

                    <div className="col-md-2 mt-3  d-flex justify-content-center">





                        <div className="importantLinks">
                            <ul>
                                <li><h5>Important Links</h5></li>
                                <li><Link to={"/About"}>About us</Link></li>
                                <li><Link to={"/Features"}> Features</Link></li>
                                <li><Link to={"/FAQ"}>FAQ's</Link></li>
                                <li><Link to={"/Testimonials"}>Testimonials</Link></li>
                                <li><Link to={"/Contact-us"}>Contact-us</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-md-6 subscribe ">

                        
                        <div  className=" ">


                            <div className="box container  mr-5 mt-5 text-white">

                                <h2>Subscribe For More info</h2>
                                <p>Please subscribe for more latest information.</p>

                                <div className="input-group ">

                                    <input
                                        style={{ borderRadius: '8px' }}
                                        type="text"
                                        placeholder="Enter your email id"
                                    />

                                    <button className="text-white" style={{ borderRadius: '8px' }}>Subscribe</button>
                                </div>

                            </div>

                            <div className="footer-links text-end  my-5">

                                <a href="https://play.google.com/store/apps/details?id=com.sportsnerve.usersapp&pcampaignid=web_share" target="_blank" rel="noopener noreferrer" className="links"><img src={playStore} alt="play store pick" className="mt-2 app-links" /></a>

                                <a href="https://apps.apple.com/us/app/sports-nerve/id6468219398" target="_blank" rel="noopener noreferrer" className="mx-3 links"><img src={appStore} alt="app-Store-pick" className="mt-2 app-links" /></a>

                            </div>

                        </div>
                    </div>
                </div>
            </div>


            <div className="footer-bottom container-fluid align-items-center d-flex justify-content-between g-0 row">
                <div className="col-md-6">

                    <p>
                        Copyright &copy; 2024. All rights reserved.
                    </p>
                </div>

                <div className="col-md-6 d-flex justify-content-end list-items">
                    <ul >
                        <li><i className="fa-brands me-1 fa-facebook"></i></li>
                        <li><i className="fa-brands me-1 fa-twitter"></i></li>
                        <li><i className="fa-brands me-1 fa-instagram"></i></li>
                        <li><i className="fa-brands me-1 fa-linkedin"></i></li>
                    </ul>
                </div>
            </div>

        </div>
    )
}

export default Footer;