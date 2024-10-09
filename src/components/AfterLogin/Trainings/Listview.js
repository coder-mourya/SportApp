import React, { useEffect } from "react";
import practice from "../../../assets/afterLogin picks/Practice/practice.svg";
import "../../../assets/Styles/colors.css";
import "../../../assets/Styles/AfterLogin/practice.css";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { fetchEvents } from "../../../reducers/eventSlice";
import AllList from "./All-list";
import Badminton from "./Badminton";
import Criket from "./Criket";


const Listview = () => {
    const [selectedOption, setSelectedOption] = useState("All");
    const eventData = useSelector((state) => state.events.events);
    const token = useSelector((state) => state.auth.user.data.user.token);

    const dispetch = useDispatch();

    // console.log("events", eventData);

    useEffect(() => {
        dispetch(fetchEvents(token))
    }, [token, dispetch])


    // handle options slections
    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };

    const renderComponent = () => {
        switch (selectedOption) {
            case "Badminton":
                return <Badminton />;
            case "Criket":
                return <Criket />;
            default:
                return <AllList />;
        }
    };


 



    return (
        <div className="container-fluid itemsColor practice rounded-4 mb-5" style={{ height: "39rem" }}>
            {eventData.length === 0 ? (
                <div className="row justify-content-center align-items-center p-5">
                    <div className="col-12 text-center">
                        <img src={practice} alt="team pick" className="img-fluid mb-3" />
                        <p className="mb-0">You have no practice here.</p>
                    </div>
                </div>
            ) : (

                <div className=" All-options my-2 d-flex justify-content-md-start">
                    <div className="Team-options custom-option-btn itemsColor py-md-2 ps-2 rounded  d-flex justify-content-md-center   justify-content-center "
                        style={{ marginLeft: "0" }}
                    >
                        <button
                            className={`btn ${selectedOption === "All" ? "btn-primary" : ""}`}
                            onClick={() => handleOptionChange("All")}
                        >
                            All
                        </button>
                        <button
                            className={`btn ${selectedOption === "Criket" ? "btn-primary" : ""}`}
                            onClick={() => handleOptionChange("Criket")}
                        >
                            Criket
                        </button>

                        <button
                            className={`btn ${selectedOption === "Badminton" ? "btn-primary" : ""}`}
                            onClick={() => handleOptionChange("Badminton")}
                        >
                            Badminton
                        </button>

                    </div>

                </div>

            )}



            <div className="">
                {renderComponent()}
            </div>

        </div>
    );
}

export default Listview;
