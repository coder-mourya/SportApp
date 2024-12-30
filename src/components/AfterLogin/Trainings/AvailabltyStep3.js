import React from "react";
import schedule from "../../../assets/afterLogin picks/home/schedule.png";
// import trainer from "../../../assets/afterLogin picks/home/chat1.png";
import { useDispatch } from "react-redux";
import { fetchTrainingDetails } from "../../../reducers/trainingSlice";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import currencySymbolMap from 'currency-symbol-map';
import { useState } from "react";
import Model from "react-bootstrap/Modal";
import what from "../../../assets/afterLogin picks/events/what.png"


const AvailabltyStep3 = ({ trainingId, availablityFilldData, step2Data }) => {
    const user = useSelector((state) => state.auth.user.data.user);
    const trainingDetails = useSelector((state) => state.trainings.eventDetails);
    const [totalPrice, setTotalPrice] = useState(0);
    // console.log("total price", totalPrice);

    console.log("step 2 data in step 3 , ", step2Data);


    const token = useSelector(state => state.auth.user.data.user.token);
    const dispatch = useDispatch();
    // get details of training
    useEffect(() => {
        if (trainingId) {
            dispatch(fetchTrainingDetails({ trainingId, token }));
        }
    }, [trainingId, token, dispatch]);

    useEffect(() => {
        const CalculateTotal = () => {
            if (step2Data?.totalSession && trainingDetails?.price) {
                let total = step2Data.totalSession * trainingDetails.price;
                setTotalPrice(total); // Assuming setTotalPrice updates your total price state
            }
        }
        CalculateTotal();
    }, [step2Data, trainingDetails]); // Add dependencies to ensure it recalculates when these values change


    // apply coupon
    const [showCoupon, setShowCoupon] = useState(false);
    const handleShowCoupon = () => {
        setShowCoupon(true);
    }

    const handleCloseCoupon = () => {
        setShowCoupon(false);
    }


    return (
        <div>

            <div className="d-flex justify-content-start align-items-center">
                {availablityFilldData?.bookingFor === "familyMember" ? (
                    <img src={availablityFilldData?.selectedFamilyMember?.image} alt="tainer" style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                    <img src={user?.profileImage} alt="tainer" style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }} />
                )}

                {availablityFilldData?.bookingFor === "familyMember" ? (
                    <h5 className="ms-3">{availablityFilldData?.selectedFamilyMember?.fullName}</h5>
                ) : (
                    <h5 className="ms-3">You</h5>
                )}

            </div>

            <div className="mt-3 rounded-3 bodyColor p-2">
                <div className="row">
                    <div className="col-md-5 d-flex justify-content-center align-items-center">
                        <img src={trainingDetails?.coverImage} alt="cover" className="rounded-3" style={{ width: "159px", height: "150px", objectFit: "cover" }} />
                    </div>

                    <div className="col-md-7">
                        <div className="d-flex align-items-center mt-2">
                            <img src={schedule} alt="watch" />
                            <p className="ms-2 pb-0 mb-0">{availablityFilldData?.startDate}</p>
                        </div>

                        <div className="mt-2">
                            <h4>{trainingDetails?.trainingName}</h4>
                            <p>Minimum session of {trainingDetails?.minimumSession}</p>
                            <p>Maximum session of {trainingDetails?.maximumSession}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div className="d-flex justify-content-between">
                    <p>Number of sessions</p>
                    <p>{step2Data?.totalSession}</p>
                </div>

                <div className="d-flex justify-content-between">
                    <p>Price per session</p>
                    <p>{currencySymbolMap(trainingDetails?.currency)}{trainingDetails?.price}</p>
                </div>

                <div className="d-flex justify-content-between">
                    <p>Promotion</p>
                    <p className="text-danger" onClick={handleShowCoupon} style={{ cursor: "pointer" }}>Apply coupan</p>
                </div>

                <div className="d-flex justify-content-between">
                    <p>Grand Total</p>
                    <p>{currencySymbolMap(trainingDetails?.currency)}{totalPrice}</p>
                </div>

                <div className="d-flex justify-content-between">
                    <p style={{ fontWeight: "bold" }}>Grand Total</p>
                    <p style={{ fontWeight: "bold" }}>{currencySymbolMap(trainingDetails?.currency)}{totalPrice} </p>
                </div>
            </div>

            <Model show={showCoupon} onHide={handleCloseCoupon} centered>
                <Model.Header closeButton>
                    Apply Coupon
                </Model.Header>

                <Model.Body>
                    <div className="mt-2">
                        <div className="d-flex justify-content-center align-items-center">
                        <img src={what} alt="what" style={{width: "200px"}} />
                        </div>
                        <p className="text-center"> You have no promotions</p>
                    </div>

                </Model.Body>
            </Model>
        </div>
    );
};

export default AvailabltyStep3;