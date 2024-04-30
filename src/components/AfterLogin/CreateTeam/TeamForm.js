import React, { useRef, useState } from "react";
import upload from "../../../assets/afterLogin picks/My team/upload.svg";
import uploadIcon from "../../../assets/afterLogin picks/My team/upload-icon.svg";
import user from "../../../assets/afterLogin picks/name.png";
import ImageCropper from "../../Utils/ImageCropper";

const TeamDetails = ({ onNext }) => {
    const fileInputRef = useRef(null);
    const logoInputRef = useRef(null);
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);

    const handleFileSelect = () => {
        fileInputRef.current.click();
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setCoverPhoto(URL.createObjectURL(file));
    };

    const handleLogoSelect = () => {
        logoInputRef.current.click();
    }

    const handleLogo = (e) => {
        const file2 = e.target.files[0];
        console.log("logo selected", file2)
    }

    const handleNext = () => {
        onNext();
    }

    const handleCropComplete = (croppedImage) => {
        setCroppedImage(croppedImage);
    };

    return (
        <div className="container-fluid">
            <div className="cover-photo rounded position-relative">
                {/* Render the selected image if available, otherwise render the default upload image */}
                {croppedImage ? (
                    <img src={URL.createObjectURL(croppedImage)} alt="cropped cover" className="img-fluid" />
                ) : (
                    <>
                        {coverPhoto && <img src={coverPhoto} alt="cover" className="img-fluid" />}
                        <div
                            className="upload-overlay position-absolute bottom-0 end-0 p-3 d-flex align-items-center"
                            onClick={handleFileSelect}
                        >
                            <img src={upload} alt="upload" />
                            <p className="mb-0 ms-2">{coverPhoto ? "Change cover photo" : "Add cover photo"}</p>
                            {/* Hidden file input */}
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                style={{ display: "none" }}
                                onChange={handleFileUpload}
                            />
                        </div>
                    </>
                )}
                
                <div className="upload-icon-container" onClick={handleLogoSelect}>
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

            <div className="team-details mt-5">
                <form>
                    <div className="row">
                        <div className="col-md-6 position-relative">
                            <label htmlFor="teamName">Team Name</label>
                            <div className="input-with-icon mt-2">
                                <input
                                    type="text"
                                    placeholder="Enter here"
                                    className="py-2 rounded"
                                />
                                <img src={user} alt="team name" className="input-icon" />
                            </div>
                        </div>
                        <div className="col-md-6 position-relative">
                            <label htmlFor="teamName">Tagline (optional)</label>
                            <div className="input-with-icon mt-2">
                                <input
                                    type="text"
                                    placeholder="Enter your tagline"
                                    className="py-2 rounded"
                                />
                                <img src={user} alt="tagline" className="input-icon" />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 ">
                            <div className=" mt-4">
                                <select id="option1" className="form-select py-2 rounded">
                                    <option value="">--Select sport type--</option>
                                    <option value="option1_value1">Option 1 Value 1</option>
                                    <option value="option1_value2">Option 1 Value 2</option>
                                    {/* Add more options as needed */}
                                </select>
                            </div>
                        </div>
                        <div className="col-md-6 ">
                            <div className=" mt-4">
                                <select id="option1" className="form-select py-2 rounded">
                                    <option value="">--Select Country--</option>
                                    <option value="option1_value1">Option 1 Value 1</option>
                                    <option value="option1_value2">Option 1 Value 2</option>
                                    {/* Add more options as needed */}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 ">
                            <div className=" mt-3">
                                <select id="option1" className="form-select py-2 rounded">
                                    <option value="">--Select State--</option>
                                    <option value="option1_value1">Option 1 Value 1</option>
                                    <option value="option1_value2">Option 1 Value 2</option>
                                    {/* Add more options as needed */}
                                </select>
                            </div>
                        </div>
                        <div className="col-md-6 ">
                            <div className=" mt-3">
                                <select id="option1" className="form-select py-2 rounded">
                                    <option value="">--Select city--</option>
                                    <option value="option1_value1">Option 1 Value 1</option>
                                    <option value="option1_value2">Option 1 Value 2</option>
                                    {/* Add more options as needed */}
                                </select>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="mt-2">
                    <p>Choose team color</p>
                    <button className="color-button red"></button>
                    <button className="color-button green"></button>
                    <button className="color-button blue"></button>
                    <button className="color-button yellow"></button>
                    <button className="color-button orange"></button>
                </div>
            </div>

            <div className="mt-3">
                <button className="btn btn-danger" onClick={handleNext}>Next</button>
            </div>

            {/* Render ImageCropper if cover photo is selected */}
            {coverPhoto && !croppedImage && (
                <ImageCropper
                    imageSrc={coverPhoto}
                    onCropComplete={handleCropComplete}
                />
            )}
        </div>
    );
};

export default TeamDetails;
