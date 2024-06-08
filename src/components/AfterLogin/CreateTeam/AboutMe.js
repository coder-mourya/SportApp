import React from "react";
import addPhotoIcon from "../../../assets/afterLogin picks/My team/upload-icon.svg";
import { useRef } from "react";
import { useState } from "react";

const AboutMe = ({ formData, onFormDataChange, onSubmit , onPrev}) => {
    const fileInputRef = useRef(null);

    const [creatorImage, setCreatorImage] = useState([]);

    const jerseySizes = [
        "YMD-10",
        "YLG 14 - 16",
        "YXL 18-20",
        "XS",   // Extra Small
        "S",    // Small
        "M",    // Medium
        "L",    // Large
        "XL",   // Extra Large
        "XXL",  // Double Extra Large
        "XXXL", // Triple Extra Large
        "4XL",  // Quadruple Extra Large
        "5XL",  // Quintuple Extra Large
        "6XL",  // Sextuple Extra Large
        "7XL",  // Septuple Extra Large
        "8XL",  // Octuple Extra Large
        "9XL",  // Nonuple Extra Large
        "10XL"  // Decuple Extra Large
    ];

    const trouserSizes = [
        "XS",         // Extra Small
        "S",          // Small
        "M",          // Medium
        "L",          // Large
        "XL",         // Extra Large
        "XXL",        // Double Extra Large
        "XXXL",       // Triple Extra Large
        "4XL",        // Quadruple Extra Large
        "5XL",        // Quintuple Extra Large
        "28",         // Numeric size 28
        "30",         // Numeric size 30
        "32",         // Numeric size 32
        "34",         // Numeric size 34
        "36",         // Numeric size 36
        "38",         // Numeric size 38
        "40",         // Numeric size 40
        "42",         // Numeric size 42
        "44",         // Numeric size 44
        "YMD-10",     // Youth Medium 10
        "YLG 14 - 16",// Youth Large 14 - 16
        "YXL 18-20"   // Youth Extra Large 18 - 20
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
                            >

                                <option >--Select Jersey Size--</option>
                                {jerseySizes.map((size) => (
                                    <option key={size} value={size}>
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

                                className="form-select py-2 rounded"
                            >
                                <option >--Select Trouser Size--</option>
                                {trouserSizes.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>


                        </div>
                    </div>
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