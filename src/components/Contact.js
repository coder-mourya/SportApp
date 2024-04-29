import React, { useState } from "react";
import axios from "axios";
import "../assets/Styles/contact.css";
import "../assets/Styles/Allfonts.css";
import Alerts from "./Alerts";

const Contact = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [message, setMessage] = useState("");
    const [alertData , setAlertData] = useState(null);

    const handleSubmit = async (event) => {

        event.preventDefault();

        try {

            const accessTokenResponse = await axios.post(
                "https://accounts.zoho.in/oauth/v2/token?refresh_token=1000.d984a5d63a969fd21407d878bc1890e3.ddd1d2c32ad7f3aa921f5bbb19df2076&client_id=1000.ROTPGF6ZNLC98LP7E545T1VM77VBGY&client_secret=eb8b9645a01786b653be2c340fe1a16933d0b16562&grant_type=refresh_token"
            );

            const accessToken = accessTokenResponse.data.access_token;

            const response = await axios.post(
                "https://www.zohoapis.in/crm/v2/Leads",
                {
                    data: [
                        {
                            Last_Name: name,
                            Email: email,
                            Dropdown: role,
                            MultiLine: message,
                        }
                    ]
                },

                {
                    headers: {
                        Authorization : `Zoho-oauthtoken ${accessToken}`
                    }
                }
            );
            console.log("Response:", response.data);
            setAlertData({ message: "Form submitted successfully!", type: "success" });
            setName("");
            setEmail("");
            setRole("");
            setMessage("");
        } catch (error) {
            console.error("Error:", error);
            setAlertData({ message: "Error occurred during submission.", type: "error" });
            setName("");
            setEmail("");
            setRole("");
            setMessage("");
        }
    };

    return (
        <div className="contact-us text-white mt-5">
            <div className="row">
            {alertData && <Alerts message={alertData.message} type={alertData.type} />}

                <div className="col-md-6 text-md-start contact-text">
                    <h1 className="allFonts">
                        <b>Reach Out & Feature <br /> Request Form !</b>
                    </h1>
                    <p className="allFonts-p">
                        We value your input within our sports ecosystem. Your insights are crucial in helping us improve and enhance your SportsNerve experience.
                    </p>
                    <div className="list">
                        <ul>
                            <li>
                                <h3 className="allFotns">125+</h3>
                                <p className="allFonts-p">Sports types</p>
                            </li>
                            <li>
                                <h3 className="allFotns">100k+</h3>
                                <p className="allFonts-p">teams</p>
                            </li>
                            <li>
                                <h3 className="allFotns">20+</h3>
                                <p className="allFonts-p">Unique Features</p>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="col-md-6">
                    <form className="form" onSubmit={handleSubmit}>
                        <div className="row mb-2">
                            <div className="col-md-6">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={name}
                                    className="form-control"
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="col-md-6">
                                <input
                                    type="text"
                                    placeholder="Email address"
                                    className="form-control"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <select
                            name="Dropdown"
                            id="sportsSelect"
                            className="form-select my-3"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="">--Select your role--</option>
                            <option value="User">User</option>
                            <option value="Facility Manager">Facility Manager</option>
                            <option value="Coach">Coach</option>
                        </select>
                        <textarea
                            name="MultiLine"
                            id="message"
                            cols="30"
                            rows="8"
                            placeholder="Write your message here..."
                            className="form-control my-4"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        ></textarea>
                        <div className="text-end submit-btn">
                            <button className="btn btn-danger" type="submit">
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
