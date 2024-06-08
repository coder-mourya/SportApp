import React from "react";
import "../assets/Styles/about.css"
import "../assets/Styles/Allfonts.css";
import polygon from "../assets/img/Polygon.svg"



const Cookies = () => {
    return (

        <div className="About us container-fluid g-0">
            <div className="d-flex justify-content-center align-items-center about text-white backIcon">
                <h1 className="allFonts">Cookies policy</h1>
            </div>
            <div className="container cookies mb-5 mt-4">
                <p>This Policy was last modified on September 1, 2023.</p>

                <h2>Introduction</h2>

                <p>We, SportsNerve Solutions Pte. Ltd. (“SportsNerve”, “Company”, “we”, “us”, “our”) may use cookies or similar technologies to analyse information about your use of our website sportsnerve.com and mobile application (“Application” or “App”). We are committed to protecting the privacy and security of your personal data. We advise you to carefully read this cookie policy (“Policy”), together with the Company’s Privacy Policy so that you are aware of the cookies and technologies used as well as how we treat your personal data.</p>
                <h2>What are Cookies? </h2>

                <p>Cookies are alphanumeric files that are placed on your device when you visit a website. It allows us to recognize your device and store some information about your preferences or past actions, analyze trends, learn about our user base, operate and improve our services and provide you with a better experience when you visit our App.</p>

                <h2>Types of Cookies Used </h2>

                <div className="d-flex polygon ">
                    <img src={polygon} alt="polygon" />
                    <p>Permanent cookies: Permanent cookies help us recognize you as an existing user, so it’s easier for you to return to the App without signing in again. After signing in, the permanent cookies stay on your browser and will be read when you return to our sites. These remain on your computer/device for a pre-defined period.</p>
                </div>

                <div className="d-flex polygon ">
                    <img src={polygon} alt="polygon" />
                    <p>Session cookies: Session cookies only last for as long as the session exists (they get erased when the user closes the browser).</p>
                </div>

                <p><b>As for the domain to which it belongs, there are either:</b></p>

                <div className="d-flex polygon ">
                    <img src={polygon} alt="polygon" />
                    <p>First-party cookies: These cookies are set by the web server of the visited page and share the same domain.</p>
                </div>

                <div className="d-flex polygon ">
                    <img src={polygon} alt="polygon" />
                    <p>Third-party cookies: These cookies are placed by a third party on your device and may provide information to us and third parties about your usage of the App.</p>
                </div>

                <div className="d-flex polygon ">
                    <img src={polygon} alt="polygon" />
                    <p>Analytical Tools: Analytics cookies or performance cookies are used to track visitors and user behavior. This data is then used to improve the App and improve user experience.</p>
                </div>

                <h2>Use of Cookies</h2>
                <p>We use personal data captured through cookies to make your interaction with us faster and more secure. They may be used for the following purposes:</p>

                <div className="d-flex polygon ">
                    <img src={polygon} alt="polygon" />
                    <p> <b>Preferences:</b> Cookies allows the App to remember information that changes the way the site behaves or looks, such as your preferred language or the region you are in. Remembering your preferences enables us to personalize and display advertisements and other contents for you.</p>
                </div>

                <div className="d-flex polygon ">
                    <img src={polygon} alt="polygon" />
                    <p><b> Security/Optimization:</b> Cookies allow us to maintain security by authenticating users, preventing fraudulent use of login credentials and protecting user data from unauthorized parties. We may use certain types of cookies to allow us to block many types of attacks, such as attempts to steal content from the forms present on the App.</p>
                </div>

                <div className="d-flex polygon ">
                    <img src={polygon} alt="polygon" />
                    <p> <b>Processing:</b> Cookies enable the App to work efficiently. Basis such cookies, we are able to deliver services that App visitors expect, like navigating around web pages or accessing secure areas of the App.</p>
                </div>

                <div className="d-flex polygon ">
                    <img src={polygon} alt="polygon" />
                    <p> <b>Advertising:</b> We use cookies to make advertising more engaging to our users. Some common applications of cookies are made to select advertising based on what’s relevant to you, to improve reporting on campaign performance and to avoid showing ads you would have already seen. Cookies capture information about how you interact with the App, which includes the pages that you visit most.</p>
                </div>


                <div className="d-flex polygon ">
                    <img src={polygon} alt="polygon" />
                    <p> <b>Communication:</b> We may use information collected via cookies to communicate with you, for sending newsletters, seek your opinion and feedback and provide you with services and promotional materials.</p>
                </div>



                <div className="d-flex polygon ">
                    <img src={polygon} alt="polygon" />
                    <p> <b>Analytics and Research:</b> We may use cookies to better understand how people use our products/services so that we can improve them.</p>
                </div>


                <h2>Disabling Cookies</h2>
                <p>You can decide whether to accept or not to accept cookies. You can disable the cookies by adjusting the settings on your browser (see your browser Help for how to do this). Disabling cookies may affect the functionality of our App.</p>

                <h2>Changes to this Policy</h2>

                <p>Please revisit this page periodically to stay aware of any changes to this Policy, which we may update from time to time. If we modify this Policy, we will make it available through the App and indicate the date of the latest revision.</p>

                <h2>Contact us </h2>

                <p>If you have any questions or concerns regarding this Policy, you can contact us at <a href="mailto:contact@spotsnerve.com?subject=Question&body=Hello,">contact@spotsnerve.com</a> </p>






            </div>


        </div>

    )
}

export default Cookies;