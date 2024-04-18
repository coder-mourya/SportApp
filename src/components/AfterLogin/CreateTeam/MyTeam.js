import React from "react";
import team from "../../../assets/afterLogin picks/My team/team.svg";
import "../../../assets/Styles/colors.css";

const MyTeam = () => {
    return (
        <div className="container-fluid itemsColor myTeam rounded">
            <div className="row justify-content-center align-items-center p-5">
                <div className="col-12 d-flex justify-content-center  align-items-center mb-3 ">
                    <img src={team} alt="team pick" className="img-fluid" />
                </div>
                <div className="col-12 text-center">
                    <p className="mb-0">You have no team here.</p>
                </div>
            </div>
        </div>
    );
}

export default MyTeam;
