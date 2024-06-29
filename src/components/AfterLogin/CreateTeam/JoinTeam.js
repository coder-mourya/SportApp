import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";


const JoinTeam = ({showLogin , setShowLogin}) => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    
    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

    useEffect(() => {
        if (isLoggedIn) {
            // console.log("teamId", teamId);
            navigate("/TeamDashbord", { state: {teamID: teamId } });
        } else {
            localStorage.setItem('teamId', teamId);
            setShowLogin(true);

        }
    }, [isLoggedIn,  teamId, navigate, setShowLogin]);

    return (
        <div>Loading...</div>
    );
}

export default JoinTeam;
