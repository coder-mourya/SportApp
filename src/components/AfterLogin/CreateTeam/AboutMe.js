import React from "react";
import addPhotoIcon from "../../../assets/afterLogin picks/My team/upload-icon.svg";
import { useRef } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

const AboutMe = ({ formData, onFormDataChange, onSubmit, onPrev }) => {
    const fileInputRef = useRef(null);

    const [creatorImage, setCreatorImage] = useState([]);

    const jerseySizes = [
        'YXS 7', 'YSM 8', 'YMD 10 - 12', 'YLG 14 - 16', 'YXL 18 - 20', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', '1X', '2X', '3X'

    ];

    const trouserSizes = [
        'YXS 7', 'YSM 8', 'YMD 10 - 12', 'YLG 14 - 16', 'YXL 18 - 20', 'XXS', 'XS', 'SM', 'MD', 'LG', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', '1X', '2X', '3X'

    ];


    const handleFileSelect = () => {
        fileInputRef.current.click();
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setCreatorImage(URL.createObjectURL(file));
        onFormDataChange({ creatorImage: file });
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        onFormDataChange({ [name]: value });
    };


    // const Navigate = useNavigate()
    // const handlePrev = () => {
    //     setSelect
    // }


    return (
        <div className="aboutMe">

            <div className="upload-icon d-flex justify-content-start align-items-center mt-3">

                {creatorImage && creatorImage.length > 0 ? (
                    <div className="d-flex flex-row align-items-center">
                        <img src={creatorImage} alt="Profile" className="profile-img" style={{ width: "117px", height: "117px" }} />
                        <p className="ms-4" onClick={handleFileSelect} style={{ cursor: 'pointer' }}>Change Profile</p>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleFileUpload}
                        />
                    </div>
                ) : (
                    <div className="add-photo d-flex justify-content-center align-items-center" onClick={handleFileSelect}>
                        <img src={addPhotoIcon} alt="Add Profile" />
                        <p className="ms-4">Add Profile</p>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleFileUpload}
                        />
                    </div>
                )}


            </div>

            <form className="form aboutme-form" onSubmit={onSubmit}>

                <div className="mt-2">
                    <label htmlFor="aboutCreator">About me </label>
                    <textarea
                        name="aboutCreator"
                        id="aboutCreator"
                        cols="30"
                        rows="10"
                        className=" form-control"
                        onChange={handleInputChange}
                        value={formData.aboutCreator}
                        placeholder="Write about your interests, hobbies, Proficiency…..
                    Hi, I am Gaurav, right handed batsman. I Played cricket for different clubs in Pune.
                    "
                        required
                    >

                    </textarea>

                </div>

                <div className="row">

                    <div className="col-md-6 ">

                        <div className=" mt-4">
                            <select id="jerseySize"
                                name="jerseySize"
                                className="form-select py-2 rounded"
                                onChange={handleInputChange}
                                value={formData.jerseySize}
                                required
                            >

                                <option value="" >--Select Jersey Size--</option>
                                {jerseySizes.map((size) => (
                                    <option  key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>


                        </div>
                    </div>

                    <div className="col-md-6 ">

                        <div className=" mt-4">
                            <select
                                id="pantSize"
                                name="pantSize"
                                value={formData.pantSize}
                                onChange={handleInputChange}
                                required
                                className="form-select py-2 rounded"
                            >
                                <option  value="">--Select Trouser Size--</option>
                                {trouserSizes.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>


                        </div>
                    </div>
                </div>

                <div className="py-1">
                    <Link to={"/size-chart"}
                        style={{
                            fontSize: "15px",
                            textDecoration: "none"
                        }}
                        target="_blank"
                    >Size Chart</Link>
                </div>

                <div className="row ">
                    <div className="col-md-6 mt-2">
                        <label htmlFor="teamName">Jersey Name</label>
                        <div className="input-with-icon ">
                            <input
                                type="text"
                                placeholder="ABC"
                                className="py-2 rounded"
                                id="nameOnJersey"
                                name="nameOnJersey"
                                value={formData.nameOnJersey}
                                onChange={handleInputChange}
                                required
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
                                id="numberOnJersey"
                                name="numberOnJersey"
                                value={formData.numberOnJersey}
                                onChange={handleInputChange}
                                required
                            />

                        </div>
                    </div>



                </div>


                <div className="mt-2">
                    <label htmlFor="expectations">Expectations from the team </label>
                    <textarea
                        name="expectations"
                        id="expectations"
                        cols="20"
                        rows="3"
                        value={formData.expectations}
                        className="form-control text-aria2"
                        placeholder="Write what do you expect from the team!"
                        style={{ resize: "none", height: "100px" }}
                        onChange={(event) => handleInputChange(event)}
                        required
                    ></textarea>


                </div>

                <div className="aboutme-buttons mt-3">
                    <button className="btn btn-secondary me-2" onClick={onPrev} >Previus</button>
                    <button className="btn btn-danger ms-2" type="submit">Submit</button>

                </div>
            </form>

        </div>
    )
}

export default AboutMe;