import React from "react";
import tick from "../../../assets/afterLogin picks/home/tick.png";
import visa from "../../../assets/afterLogin picks/home/visa.png";
import currencySymbolMap from 'currency-symbol-map';
import { useSelector } from "react-redux";


const SavedCards = ({step3Data}) => {
    const trainingDetails = useSelector((state) => state.trainings.eventDetails);

    console.log("step 3 data in saved card", step3Data);
    
    return (
        <div className="">
            <div className="d-flex justify-content-between ">
                <p>Amount to be paid</p>
                <p>{currencySymbolMap(trainingDetails?.currency)}{step3Data?.totalPrice}</p>
            </div>

            <div className="g-0">
                <h5>Saved Cards</h5>

                <div className=" rounded-4 mt-3" style={{ backgroundColor: "#FBE9E9", height: "230px" }}>
                    <div className="d-flex justify-content-between align-items-center pt-3">
                        <p className="ms-3 mb-0 pb-0">Card holder name</p>
                        <img src={tick} alt="trick mark" style={{ width: "20px", height: "20px" }} className="me-3 pt-0 mt-0" />
                    </div>

                    <div className="mt-3 ms-3">
                        <h5 style={{ fontWeight: "400" }}>4244 xxxx xxxx 1234</h5>
                    </div>

                    <div className=" ms-3 d-flex justify-content-between align-items-center " style={{marginTop: "5rem"}}  >
                        <div>
                            <p className="mb-0 pb-0">Exp. date</p>
                            <h4 style={{ fontWeight: "400" }}>05/24</h4>
                        </div>
                        <div>
                            <img src={visa} style={{ width: "60px" }} alt="cardType" className="me-3" />
                        </div>
                    </div>

                </div>

                <div className="mt-3">
                    <button className="btn btn-outline-primary" style={{width: "45%"}}>+   Add new card</button>
                </div>
            </div>
        </div>
    );
};

export default SavedCards;