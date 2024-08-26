import React from "react";
import sportPic from "../../../assets/afterLogin picks/My team/team.svg";

const TrainingSchedule = ({eventData}) => {
    return (
        <div className="row justify-content-center align-items-center p-5">
        <div className="col-12 text-center">
            <img src={sportPic} alt="team pick" className="img-fluid mb-3" />
            <p className="mb-0">You have no training yet</p>
        </div>
    </div>
    )
}

export default TrainingSchedule