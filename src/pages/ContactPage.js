import React from "react";
import "../assets/Styles/about.css"
import "../assets/Styles/Allfonts.css";
import Contact from "../components/Contact";
import "../assets/Styles/contact.css";

const CustomContact = () => {
    return (
        <div className="custom-contact">
            <Contact />
        </div>
    );
}


const ContactPage = () => {
    return (

        <div className="About us container-fluid g-0">
            <div className="d-flex justify-content-center align-items-center about text-white backIcon">
                <h1 className="allFonts">Contact Us</h1>
            </div>

                <CustomContact />
        </div>

    )
}

export default ContactPage;