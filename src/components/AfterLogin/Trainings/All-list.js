import React, { useEffect } from "react";
import location from "../../../assets/afterLogin picks/home/location.png";
import schedule from "../../../assets/afterLogin picks/home/schedule.png";
import watch from "../../../assets/afterLogin picks/home/watch.png";
import {useNavigate} from "react-router-dom";
import { fetchTrainings } from "../../../reducers/trainingSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import {formatDate, formatTime} from "../../Utils/dateUtils";
// import star from "../../../assets/afterLogin picks/events/star.png";



const AllList = () => {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.user.data.user.token);
    const Navigate = useNavigate();
    const trainings = useSelector((state) => state.trainings.events);
    // console.log("trainings", trainings);
    

   const  handleTrainingClick = (trainingId) => {    
        Navigate('/trainingDashBord' , { state: { trainingId } });
    };

    useEffect(() => {
        dispatch(fetchTrainings(token ));
    }, [token, dispatch]);

    return (

        <div className="row training-list mt-3">
            {trainings?.map((training, index) => (
                <div className="col-md-6 d-flex justify-content-center" 
                onClick={() => handleTrainingClick(training?.trainingId)}
                >
                    <div key={index} className="row py-3 event-item   itemsColor rounded-4 d-flex ">
                        <div className="col-3 d-flex justify-content-center align-items-center">
                            <img src={training?.coverImage} alt="event pick" className="img-fluid rounded-3 training-cover-image" />
                        </div>
                        <div className="col-7 event-icons">
                            <h4 className="mb-md-2">{training?.trainingName}</h4>
                            <div className="mb-2">
                                <div className="d-flex mt-md-3 align-items-center">
                                    <img src={location} alt="location" className="me-2 " />
                                    <p className="mb-0">
                                        {window.innerWidth <= 576 ? training?.address?.substring(0, 10) + "..." : training?.address}

                                    </p>
                                </div>
                            </div>
                            <div className="mb-2">
                                <div className="d-flex mt-md-3 align-items-center">
                                    <img src={schedule} alt="schedule" className="me-2 " />
                                    <p className="mb-0">{formatDate(training?.createdAt)}</p>
                                </div>
                            </div>
                            <div>
                                <div className="d-flex mt-md-3 align-items-center">
                                    <img src={watch} alt="watch" className="me-2" />
                                    <p className="mb-0">{formatTime(training?.createdAt)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-2 d-flex justify-content-center align-items-end">
                                <div className="d-flex justify-content-center align-items-center" style={{width: "76px", height: "30px", backgroundColor: "#FBE9E9", borderRadius: "4px"}}>
                                    {/* <img src={star} alt="star" style={{width: "16px", height: "16px"}} /> */}
                                    <p className="text-danger " style={{ fontWeight: "500", fontSize: "20px" }}>★</p>
                                    <p className="ps-2" style={{color: "#03061F", fontWeight: "500"}}>{training?.rating}</p>
                                </div>
                        </div>
                    </div>
                </div>

            ))}
        </div>

    );
}

export default AllList