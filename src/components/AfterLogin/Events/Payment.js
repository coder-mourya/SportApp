import React from "react";
import AllExpenses from "./AllExpenses";
import { useState } from "react";
import "../../../assets/Styles/AfterLogin/event.css"
import PaymentStatus from "./PaymentStatus";

const Payment = ({eventId}) => {

    const [activeButton, setActiveButton] = useState('Member');

    const handleButtonClick = (button) => {
      setActiveButton(button);
    };

    // console.log("event id in payment parent ", eventId);



    return (
        <div className="memerStatus container-fluid">


            
                <div className="option-btn d-flex  justify-content-around  border p-2 rounded-3">
                   
                    <button
                        className={`btn btn-${activeButton === 'Expenses' ? 'primary' : ''}`}
                        onClick={() => handleButtonClick('Expenses')}
                    >
                         Expenses List
                    </button>

                    <button
                        className={`btn btn-${activeButton === 'Member' ? 'primary' : ''} mr-2`}
                        onClick={() => handleButtonClick('Member')}
                    >
                        Payment Status
                    </button>
                </div>
           

            {activeButton === 'Member' ? <PaymentStatus eventId={eventId} /> : <AllExpenses  eventId={eventId}/>}


           
           
        </div>


    )
}

export default Payment;