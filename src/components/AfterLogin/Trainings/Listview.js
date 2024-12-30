import React, { useEffect } from "react";
import practice from "../../../assets/afterLogin picks/Practice/practice.svg";
import "../../../assets/Styles/colors.css";
import "../../../assets/Styles/AfterLogin/practice.css";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { fetchEvents } from "../../../reducers/eventSlice";
import AllList from "./All-list";
// import Badminton from "./Badminton";
// import Criket from "./Criket";


const Listview = () => {
    const [selectedOption, setSelectedOption] = useState("All");
    const eventData = useSelector((state) => state.events.events);
    const token = useSelector((state) => state.auth.user.data.user.token);
    const userData = useSelector((state) => state.auth.user.data.user);
    const chosenSports = userData?.chosenSports || [];
    console.log("user data", userData?.chosenSports);
    

    const dispetch = useDispatch();

    // console.log("events", eventData);

    useEffect(() => {
        dispetch(fetchEvents(token))
    }, [token, dispetch])


    // handle options slections
    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };

    const SportComponent = ({ sportName }) => {
        return (
            <div>
                <h3>{sportName} Component</h3>
                {/* You can add more dynamic content related to the sport here */}
                <p>This is the {sportName} section, where you can display sport-specific data.</p>
            </div>
        );
    };

    const renderComponent = () => {
        if (selectedOption === "All") {
            return <AllList />;
        } else {
            return <SportComponent sportName={selectedOption} />;
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

                <div className="All-options my-2 d-flex justify-content-md-start">
                    <div className="itemsColor py-2 ps-2 rounded-4 training-options d-flex "
                        style={{ marginLeft: "0",
                            border: "1px solid #ccc",
                            overflowX: "auto",
                            whiteSpace: "nowrap",                           
                         }}

                    >
                        <button
                            className={`btn  ${selectedOption === "All" ? "selected-button" : ""}`}
                            onClick={() => handleOptionChange("All")}
                        >
                            All
                        </button>

                         {/* Dynamically render buttons for each sport in chosenSports */}
                         {chosenSports.map((sport, index) => (
                            <button
                                key={index}
                                className={`btn mx-2 ${selectedOption === sport.sports_name ? "selected-button" : ""}`}
                                onClick={() => handleOptionChange(sport.sports_name)}
                            >
                                {sport.sports_name}
                            </button>
                        ))}

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
