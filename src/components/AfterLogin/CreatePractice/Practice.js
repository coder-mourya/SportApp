import React from "react";
import practice from "../../../assets/afterLogin picks/Practice/practice.svg";
import CurrentPractice from "./CurrentPractice";
import PrevPractice from "./PrevPractice";
import "../../../assets/Styles/colors.css";
import "../../../assets/Styles/AfterLogin/practice.css";
import { useState } from "react";



const Practice = () => {
    const [selectedOption, setSelectedOption] = useState("CurrentPractice");


    const eventData = [
        {
            id: 1,
            title: 'CUP-Semi final',
            location: 'Somerville, New Jersey',
            date: '21 Jan, 2023',
            time: '8AM - 10AM'
        },
        {
            id: 2,
            title: 'CUP-Final',
            location: 'New York City, New York',
            date: '28 Jan, 2023',
            time: '10AM - 12PM'
        },

        {
            id: 3,
            title: 'CUP-Semi final',
            location: 'Somerville, New Jersey',
            date: '21 Jan, 2023',
            time: '8AM - 10AM'
        },
        {
            id: 4,
            title: 'CUP-Final',
            location: 'New York City, New York',
            date: '28 Jan, 2023',
            time: '10AM - 12PM'
        },
        // Add more events as needed
    ];

    // handle options slections
    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };

    const renderComponent = () => {
        switch (selectedOption) {
            case "CurrentPractice":
                return <CurrentPractice />;
            case "PrevPractice":
                return <PrevPractice />;
            default:
                return <CurrentPractice />;
        }
    };



    return (
        <div className="container-fluid itemsColor practice rounded">
            {eventData.length === 0 ? (
                <div className="row justify-content-center align-items-center p-5">
                    <div className="col-12 text-center">
                        <img src={practice} alt="team pick" className="img-fluid mb-3" />
                        <p className="mb-0">You have no practice here.</p>
                    </div>
                </div>
            ) : (

                <div className=" All-options my-2 d-flex justify-content-start  ">
                    <div className=" Team-options itemsColor py-2  rounded ">
                        <button
                            className={`btn ${selectedOption === "CurrentPractice" ? "btn-primary" : ""}`}
                            onClick={() => handleOptionChange("CurrentPractice")}
                        >
                            Current
                        </button>
                        <button
                            className={`btn ${selectedOption === "PrevPractice" ? "btn-primary" : ""}`}
                            onClick={() => handleOptionChange("PrevPractice")}
                        >
                            Previous
                        </button>

                    </div>

                </div>

            )}



            <div className="container-fluid ">{renderComponent()}</div>

        </div>
    );
}

export default Practice;
