import React from "react";
import uploadIcon from "../../../assets/afterLogin picks/My team/upload-icon.svg";


const AboutMe = () => {
    return (
        <div className="aboutMe">

            <div className="upload-icon d-flex justify-content-start align-items-center mt-3">

                <img src={uploadIcon} alt="upload icon" />

                <p className="ms-4">Add profile image</p>

            </div>

            <form className="form aboutme-form">

                <div className="mt-2">
                    <label htmlFor="aboutme">About me </label>
                    <textarea
                        name="about me "
                        id="AboutMe"
                        cols="30"
                        rows="10"
                        className=" form-control"
                        placeholder="Write about your interests, hobbies, Proficiency…..
                    Hi, I am Gaurav, right handed batsman. I Played cricket for different clubs in Pune.
                    "
                    >

                    </textarea>

                </div>

                <div className="row">

                    <div className="col-md-6 ">

                        <div className=" mt-4">
                            <select id="option1" className="form-select py-2 rounded">
                                <option value="">--Select Jersey Size--</option>
                                <option value="option1_value1">Option 1 Value 1</option>
                                <option value="option1_value2">Option 1 Value 2</option>
                                {/* Add more options as needed */}
                            </select>


                        </div>
                    </div>

                    <div className="col-md-6 ">

                        <div className=" mt-4">
                            <select id="option1" className="form-select py-2 rounded">
                                <option value="">--Select Trouser Size--</option>
                                <option value="option1_value1">Option 1 Value 1</option>
                                <option value="option1_value2">Option 1 Value 2</option>
                                {/* Add more options as needed */}
                            </select>


                        </div>
                    </div>
                </div>

                <div className="row ">
                    <div className="col-md-6 mt-2">
                        <label htmlFor="teamName">Jersey Number</label>
                        <div className="input-with-icon ">
                            <input
                                type="text"
                                placeholder="ABC"
                                className="py-2 rounded"
                            />

                        </div>
                    </div>
                    <div className="col-md-6 mt-2">
                        <label htmlFor="teamName">Jersey Number</label>
                        <div className="input-with-icon ">
                            <input
                                type="text"
                                placeholder="000"
                                className="py-2 rounded"
                            />

                        </div>
                    </div>



                </div>


                <div className="mt-2">
                    <label htmlFor="aboutme">Expectations from the team </label>
                    <textarea
                        name="about me "
                        id="AboutMe"
                        cols="20"
                        rows="3"
                        className=" form-control text-aria2"
                        placeholder="Write what do you expect from the team!"
                        style={{ resize: "none", height : "100px"}}
                    >

                    </textarea>

                </div>

                <div className="aboutme-buttons mt-3">
                    <button className="btn btn-secondary me-2">Previus</button>
                    <button className="btn btn-danger ms-2">Submit</button>

                </div>
            </form>

        </div>
    )
}

export default AboutMe;