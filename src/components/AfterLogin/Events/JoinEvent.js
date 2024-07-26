import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";


const JoinEvent = ({showLogin , setShowLogin}) => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    
    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

    useEffect(() => {
        if (isLoggedIn) {
            // console.log("eventId", eventId);
            navigate("/EventDetails", { state: {eventId: eventId } });
        } else {
            localStorage.setItem('eventId', eventId);
            setShowLogin(true);

        }
    }, [isLoggedIn,  eventId, navigate, setShowLogin]);

    return (
        <div>Loading...</div>
    );
}

export default JoinEvent;
