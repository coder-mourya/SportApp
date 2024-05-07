import React from "react";
import pick1 from "../../../assets/afterLogin picks/events/pic1.svg";
import pick2 from "../../../assets/afterLogin picks/events/pic2.svg";
import pick3 from "../../../assets/afterLogin picks/events/pic3.svg";
import pick4 from "../../../assets/afterLogin picks/events/pic4.svg";


const PendingComponent = () => {

    const members = [
        {
            name: "Gaurav Kapur",
            image: pick1
        },

        {
            name: "SOURABH SINHA",
            image: pick2
        },

        {
            name: "RAJEEV JAIN",
            image: pick3
        },

        {
            name: "Kris Hary",
            image: pick4
        }
    ]



    return (
        <div className="pending-component ">
            <div className="row ">
                {members.map((member, index) => (
                    <div key={index} className="member-container col-md-12 d-flex  p-2 my-2 rounded-3 row">
                        <div className="col-md-2">

                        <img src={member.image} alt={member.name} />
                        </div>
                        <div className=" d-flex justify-content-start align-items-center col-md-6">

                            <p className="ms-2">{member.name}</p>
                        </div>

                        <div className="d-flex justify-content-center align-items-center col-md-4"><p className="cownDown">04:30</p></div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PendingComponent;