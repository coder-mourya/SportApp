import React from "react";
import "../assets/Styles/contact.css";
import "../assets/Styles/Allfonts.css";
import axios from "axios";
import { useState  } from "react";


const Contact = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [message, setMessage] = useState("");


    const handleSubmit = async (event) => {
        event.preventDefault();
    
        try {
          // Make API call using Axios
          const response = await axios.post("https://www.zohoapis.in/crm/v2/Leads", {
            name,
            email,
            role,
            message,
          });
    
          // Handle the response
          console.log("Response:", response.data);
    
          // Reset form fields after successful submission
          setName("");
          setEmail("");
          setRole("");
          setMessage("");
        } catch (error) {
          // Handle errors
          console.error("Error:", error);
        }
      };

      

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

                    <form className="form" onSubmit={handleSubmit}>

                        <div className="row mb-2">

                            <div className="col-6">

                                <input

                                    type="text"
                                    placeholder="Name"
        value={name}
                                    className="form-control "
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="col-6">

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
                        name="role"
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


                        <textarea name="message"
                            id="message" cols="30"
                            rows="8"
                            placeholder="Write your message here..."
                            className="form-control my-4 "
                            value={message}
              onChange={(e) => setMessage(e.target.value)}
                            >
                                

                        </textarea>

                        <div className="text-end submit-btn">

                            <button className="btn btn-danger" type="submit">
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