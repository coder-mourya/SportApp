import React from "react";
import "./contact.css";

const Contact = () => {
    return (
        <div className=" contact-us text-white mt-5">

            <div className="row  ">

                <div className="col-md-6  text-start contact-text">
                    <h1><b>Reach Out & Feature <br />
                        Request Form !</b></h1>

                    <p >We value your input within our sports ecosystem. Your insights
                        are crucial in helping us improve and enhance your SportsNerve experience.</p>

                    <div className="list">
                        <ul>
                            <li>

                                <h3>125+</h3>
                                <p>Sports types</p>

                            </li>
                            <li>
                                <h3>100k+</h3>
                                <p>teams</p>
                            </li>

                            <li>
                                <h3>20+</h3>
                                <p>Unique Features</p>
                            </li>
                        </ul>

                    </div>
                </div>


                <div className="col-md-6">

                    <form className="form">
                        <input

                            type="text"
                            placeholder="Name"
                            

                        />

                        <input

                            type="text"
                            placeholder="Email address"
                        />
                        <br />

                        <select name="role" id="sportsSelect">

                            <option value="">--Select your role--</option>
                            <option value="role 1">Role 1</option>
                            <option value="role 2">Role 2</option>
                            <option value="role 3">Role 3</option>


                        </select>
                        <br />

                        <textarea name="message" id="message" cols="30" rows="8" placeholder="Write your message here...">

                        </textarea>
                        <br />

                        <button className="btn submit-btn">
                            submit
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}


export default Contact;