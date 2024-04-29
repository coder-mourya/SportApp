import React from "react";
import team from "../../../assets/afterLogin picks/My team/team.svg";
import "../../../assets/Styles/colors.css";
import invite from "../../../assets/afterLogin picks/My team/invite.svg";
import share from "../../../assets/afterLogin picks/My team/share.svg";
import { teams } from "../../../assets/DummyData/TeamData";
import { useNavigate } from "react-router-dom";

const MyTeam = () => {
    const Navigate = useNavigate();

    // navigate to team dashbord
    const handleTeamDashbord = () => {
        Navigate("/TeamDashbord")
    }

    return (
        <div className="container-fluid itemsColor myTeam rounded">
            {teams.length === 0 ? (
                <div className="row justify-content-center align-items-center p-5">
                    <div className="col-12 text-center">
                        <img src={team} alt="team pick" className="img-fluid mb-3" />
                        <p className="mb-0">You have no team here.</p>
                    </div>
                </div>
            ) : (
                <div className="row justify-content-center align-items-center p-md-5">
                    {teams.map((team, index) => (

                        <div key={index} className="col-12 col-md-6 mb-3 mt-2  ">

                            <div className="d-flex align-items-center teams-container p-3" onClick={handleTeamDashbord}>
                                {/* Step 1: Image (unchanged) */}
                                <img src={team.image} className="card-img-top main-pick" alt="Team" />

                                {/* Step 2: Team Name and Sport Icon */}
                                <div className="ms-3 ">
                                    <div className="teamName   mb-3">
                                        <h5 className="card-title">{team.teamName}</h5>
                                    </div>

                                    <div className="d-flex justify-content-center  sportIcon px-2 ">
                                        <div className="mx-2 d-flex  align-items-center">
                                            <img src={team.sportIcon} alt="sporticon" />
                                        </div>
                                        <div className="mx-2 ">
                                            <p className="sport-text">
                                                {/* slice text in small screens */}
                                                {window.innerWidth <= 1284 ? (
                                                    team.sportType.slice(0, 7) + ".."
                                                ) : (
                                                    team.sportType
                                                )}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 3: Share Buttons */}
                                <div className="ms-auto d-flex share-btn">

                                    <img src={invite} alt="invite" className="mx-2" />

                                    <img src={share} alt="share" className="mx-2" />

                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            )}
        </div>
    );
}

export default MyTeam;
