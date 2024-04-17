import { useState } from "react";
import React from "react";
import "../assets/Styles/alert.css"

const Alerts = ({message , type}) =>{

    const [showAlert , setAlert] = useState(true);



    const handleCloseAlrt = () =>{

        setAlert(false);
    }


    return (

        

        showAlert &&( 

            <div className={`alert ${type}`}>
                <span className="closebtn" onClick={handleCloseAlrt}> &times;</span>
                {message}
            </div>

        )

        
    )
}


export default Alerts;
