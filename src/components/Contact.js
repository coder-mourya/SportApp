import React from "react";
import "../assets/Styles/contact.css";
import "../assets/Styles/Allfonts.css";


const Contact = () => {
    return (
        <div className=" contact-us text-white mt-5">

            <div className="row  ">

                <div className="col-md-6  text-start contact-text">
                    <h1 className="allFonts"><b>Reach Out & Feature <br />
                        Request Form !</b></h1>

                    <p className="allFonts-p">We value your input within our sports ecosystem. Your insights
                        are crucial in helping us improve and enhance your SportsNerve experience.</p>

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

                    <form className="form">

                        <div className="row mb-2">

                            <div className="col-6">

                                <input

                                    type="text"
                                    placeholder="Name"

                                    className="form-control "
                                />
                            </div>

                            <div className="col-6">

                                <input

                                    type="text"
                                    placeholder="Email address"

                                    className="form-control"

                                />
                            </div>
                        </div>


                        <select name="role" id="sportsSelect" className="form-select my-3">

                            <option value="">--Select your role--</option>
                            <option value="role 1">Role 1</option>
                            <option value="role 2">Role 2</option>
                            <option value="role 3">Role 3</option>


                        </select>


                        <textarea name="message"
                            id="message" cols="30"
                            rows="8"
                            placeholder="Write your message here..."
                            className="form-control my-4 ">

                        </textarea>

                        <div className="text-end submit-btn">

                            <button className="btn btn-danger">
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}


export default Contact;