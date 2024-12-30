import React from "react";
import tick from "../../../assets/afterLogin picks/home/tick.png";


const AddCards = () => {
    return (
        <div>
            <form className="form-group">
                <div>
                    <label className="form-label" style={{ fontSize: "14px" }}>Card holder’s name</label>
                    <input type="text"
                        className="form-control py-2"
                        placeholder="Enter Card holder’s name"
                    />
                </div>

                <div className="mt-2">
                    <label className="form-label" style={{ fontSize: "14px" }}>Card Number</label>
                    <input type="text"
                        className="form-control py-2"
                        placeholder="Enter 16-digit card number"
                    />
                </div>

                <div className="d-flex justify-content-between mt-2">
                    <div>
                        <label className="form-label" style={{ fontSize: "14px" }}>Exp. Date</label>
                        <input type="text"
                            className="form-control py-2"
                            placeholder="MM/YY"
                        />
                    </div>

                    <div>
                        <label className="form-label" style={{ fontSize: "14px" }}>CVV</label>
                        <input type="text"
                            className="form-control py-2"
                            placeholder="***"
                        />
                    </div>
                </div>
            </form>

            <div className="d-flex justify-content-start align-items-center mt-3">
                <img src={tick} style={{ width: "20px", height: "20px" }} alt="tick" />
                <p className="mb-0 pb-0 ms-2" style={{color: "#4F5163"}}>Save card in further payments.</p>
            </div>
        </div>
    );
};

export default AddCards;