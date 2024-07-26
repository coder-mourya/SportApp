import React from "react";
import Status from "./Status";
import AllExpenses from "./AllExpenses";
import { useState } from "react";
import "../../../assets/Styles/AfterLogin/event.css"

const MemberStatus = ({eventId}) => {

    const [activeButton, setActiveButton] = useState('Member');

    const handleButtonClick = (button) => {
      setActiveButton(button);
    };

    // console.log("event id ", eventId);



    return (
        <div className="memerStatus container-fluid">


            
                <div className="option-btn d-flex  justify-content-around  border p-2 rounded-3">
                    <button
                        className={`btn btn-${activeButton === 'Member' ? 'primary' : ''} mr-2`}
                        onClick={() => handleButtonClick('Member')}
                    >
                        Member Status
                    </button>
                    <button
                        className={`btn btn-${activeButton === 'Expenses' ? 'primary' : ''}`}
                        onClick={() => handleButtonClick('Expenses')}
                    >
                        All Expenses
                    </button>
                </div>
           

            {activeButton === 'Member' ? <Status eventId={eventId} /> : <AllExpenses  eventId={eventId}/>}


           
           
        </div>


    )
}

export default MemberStatus;