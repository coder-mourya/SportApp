import React from "react";
import cros from "../../../assets/afterLogin picks/My team/Cross.svg";
import { useNavigate } from "react-router-dom";
import "../../../assets/Styles/AfterLogin/Addmember.css";
import uploadIcon from "../../../assets/afterLogin picks/My team/upload-icon.svg";
import user from "../../../assets/afterLogin picks/name.png";
import { useRef } from "react";
import mail from "../../../assets/afterLogin picks/mail.png";
import phone from "../../../assets/afterLogin picks/My team/phone.svg";



const AddMember = () => {
    const logoInputRef = useRef(null);


    const Navigate = useNavigate();

    // Function to navigate back to the main page
    const handleCros = () => {
        Navigate("/CreateTeam");
    };

    const handleLogoSelect = () => {
        logoInputRef.current.click();
    }
    const handleLogo = (e) => {
        const file2 = e.target.files[0];
        console.log("logo selected", file2)
    }

    return (
        <div className="container-fluid Add-member">
            <div className="background"></div>
            <div className="half-container p-4">
                <div className="d-flex justify-content-between align-items-center">
                    <h2>Add member</h2>
                    <img src={cros} alt="cross button" className="cross-button" onClick={handleCros} />
                </div>
                <div className="d-flex  justify-content-center mt-4 ">

                    <div className="upload-icon-div" onClick={handleLogoSelect}>
                        <img src={uploadIcon} alt="upload icon" />

                        <input
                            type="file"
                            accept="image/*"
                            ref={logoInputRef}
                            style={{ display: "none" }}
                            onChange={handleLogo}
                        />
                    </div>





                </div>

                <form className="form ">
                    <div className="position-relative">
                        <label htmlFor="teamName">Full Name</label>
                        <div className="input-with-icon mt-3">
                            <input
                                type="text"
                                placeholder="Enter your Name "
                                className="py-2 rounded form-control"
                            />
                            <img src={user} alt="team name" className="input-icon " />
                        </div>
                    </div>

                    <div className=" mt-3">
                        <label htmlFor="formSelect">Sport type</label>
                        <select id="option1" className="form-select py-2 rounded form-select">
                            <option value="">--Select sport type--</option>
                            <option value="option1_value1">Option 1 Value 1</option>
                            <option value="option1_value2">Option 1 Value 2</option>
                            {/* Add more options as needed */}
                        </select>


                    </div>

                    <div className="position-relative">
                        <label htmlFor="teamName">Email address</label>
                        <div className="input-with-icon mt-3">
                            <input
                                type="text"
                                placeholder="Enter email address "
                                className="py-2 rounded form-control"
                            />
                            <img src={mail} alt="team name" className="input-icon " />
                        </div>
                    </div>

                    <div className="position-relative">
                        <label htmlFor="teamName">Mobile number</label>
                        <div className="input-with-icon mt-3">
                            <input
                                type="text"
                                placeholder="Enter  mobile number "
                                className="py-2 rounded  form-control"
                            />
                            <img src={phone} alt="team name" className="input-icon " />
                        </div>
                    </div>

                    <div className="addMember-btn fixed-bottom  d-flex justify-content-center  mb-xxl-3 mb-3">
                        <button className="btn btn-danger ">Save</button>
                    </div>

                </form>

            </div>
        </div>
    );
};

export default AddMember;
