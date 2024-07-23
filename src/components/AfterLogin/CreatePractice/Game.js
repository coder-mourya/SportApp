import React, { useEffect } from "react";
import practice from "../../../assets/afterLogin picks/Practice/practice.svg";
import CurrentGames from "./CurrentGames";
import PrevGames from "./PrevGames";
import "../../../assets/Styles/colors.css";
import "../../../assets/Styles/AfterLogin/practice.css";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { fetchEvents } from "../../../reducers/eventSlice";



const Game = () => {
    const [selectedOption, setSelectedOption] = useState("CurrentPractice");
    const eventData = useSelector((state) => state.events.events);
    const token = useSelector((state) => state.auth.user.data.user.token);

    const dispetch = useDispatch();

    console.log("events", eventData);

    useEffect(() =>{
        dispetch(fetchEvents(token))
    }, [token, dispetch])


    // handle options slections
    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };

    const renderComponent = () => {
        switch (selectedOption) {
            case "CurrentPractice":
                return <CurrentGames />;
            case "PrevPractice":
                return <PrevGames />;
            default:
                return <CurrentGames />;
        }
    };



    return (
        <div className="container-fluid itemsColor practice rounded">
            {eventData.length === 0 ? (
                <div className="row justify-content-center align-items-center p-5">
                    <div className="col-12 text-center">
                        <img src={practice} alt="team pick" className="img-fluid mb-3" />
                        <p className="mb-0">You have no games here.</p>
                    </div>
                </div>
            ) : (

                <div className=" All-options my-2 d-flex justify-content-md-start   ">
                    <div className=" Team-options custom-option-btn itemsColor py-2  rounded  d-flex justify-content-md-center   justify-content-center "
                     
                    >
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

export default Game;
