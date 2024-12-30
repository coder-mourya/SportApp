import React, { useEffect, useState } from "react";
import Sidebar from "../../components/AfterLogin/Sidebar";
import SidebarSmallDevice from "../../components/AfterLogin/SidebarSmallDevice";
import arrow from "../../assets/afterLogin picks/My team/arrow.svg";
import "../../assets/Styles/AfterLogin/createTeam.css";
import { useNavigate } from "react-router-dom";
import schedule from "../../assets/afterLogin picks/home/schedule.png";
// import Sessions from "../../components/AfterLogin/CreatePractice/Sessions";
import Offcanvas from 'react-bootstrap/Offcanvas';
import AvailabltyStep2 from "../../components/AfterLogin/Trainings/AvailabltyStep2";
import AvailabltyStep3 from "../../components/AfterLogin/Trainings/AvailabltyStep3";
import AvailabltyStep1 from "../../components/AfterLogin/Trainings/AvailabltyStep1";
import SavedCards from "../../components/AfterLogin/Trainings/SavedCards";
import AddCards from "../../components/AfterLogin/Trainings/AddCards";
import { useLocation } from "react-router-dom";
import { fetchTrainingDetails } from "../../reducers/trainingSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { formatDate } from "../../components/Utils/dateUtils";
// import star from "../../assets/afterLogin picks/events/star.png";
import meeting from "../../assets/afterLogin picks/events/meeting.svg";
import review from "../../assets/afterLogin picks/home/chat1.png";
import { BaseUrl } from "../../reducers/Api/bassUrl";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
// import { BaseUrl } from "../../reducers/Api/bassUrl";
// import axios from "axios";
import currencySymbolMap from 'currency-symbol-map';
import moment from "moment";





const TrainingDashBord = () => {
    const [mainContainerClass, setMainContainerClass] = useState("col-md-11");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const Location = useLocation();
    const trainingId = Location?.state?.trainingId;
    // console.log("training id", trainingId);
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.user.data.user.token);
    const trainingDetails = useSelector((state) => state.trainings.eventDetails);

    console.log("training details", trainingDetails);

    const [formData, setFormData] = useState({
        step1: {
            startDate: "",
            days: [],
            bookingFor: "myself",
        },
        step2: {
            sessionTimeDuration: '',
            pricePerSession: '',
            currency: '',
            startDate: '',
            endDate: '',
            expectations: "",
            showPreviousEvaluation: false,
            localCountry: '',
        }

    });

    useEffect(() => {
        if (trainingDetails) {
            setFormData({
                step1: {
                    startDate: "",
                    days: [],
                    bookingFor: "myself",
                },
                step2: {
                    sessionTimeDuration: trainingDetails?.sessionTimeDuration,
                    pricePerSession: trainingDetails?.price,
                    currency: trainingDetails?.currency,
                    startDate: moment(trainingDetails?.startDate).format("YYYY-MM-DD"),
                    endDate: moment(trainingDetails?.endDate).format("YYYY-MM-DD"),
                    expectations: "",
                    showPreviousEvaluation: false,
                    localCountry: trainingDetails?.localCountry,
                }
            });
        }
    }, [trainingDetails]);  // This will run once trainingDetails is available
    

    const resetFormData = () => {
        setFormData({
            step1: {
                startDate: "",
                days: [],
                bookingFor: "myself",
            },
           
        });
    };


    const handleFormDataChange = (data) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            step1: {
                ...prevFormData.step1,
                ...data
            },
            step2: {
                ...prevFormData.step2,
                ...data
            }
        }));
    };

    // const handleFormDataChange = (data, step = 'step2') => {
    //     setFormData((prevFormData) => ({
    //         ...prevFormData,
    //         [step]: {
    //             ...prevFormData[step],
    //             ...data
    //         }
    //     }));
    // };
    



    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
        setMainContainerClass(sidebarOpen ? "col-md-11" : "col-md-10");
    };


    const Navigate = useNavigate();

    const handleClose = () => {
        Navigate("/training-list");
    }

    // get details 

    useEffect(() => {
        if (trainingId) {
            dispatch(fetchTrainingDetails({ trainingId, token }));
        }
    }, [trainingId, token, dispatch]);


    const [showAvailability, setShowAvailability] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [availabltyData, setAvailabltyData] = useState([]);
    const [availablityFilldData, setAvailablityFilldData] = useState([]);
    const [step2Data, setStep2Data] = useState([]);
    const [step3Data, setStep3Data] = useState([]);
    // console.log("availabltyData", availabltyData);

    // const [stepData, setStepData] = useState({});

    // const updateStepData = (step, data) => {
    //     setStepData((prevData) => ({
    //         ...prevData,
    //         [step]: data,
    //     }))
    // }

    const handleShowAvailability = () => {
        setShowAvailability(true);
    };

    const handleCloseAvailability = () => {
        resetFormData();
        setShowAvailability(false);
        setCurrentStep(1);
    };


    const handleChekAvailability = async () => {
        const Url = BaseUrl();
        const data = {
            trainingId: trainingId,
            ...formData.step1
        }

        setAvailablityFilldData(null);
        console.log("check data sending ", data);
        setAvailablityFilldData(data);


        try {
            const res = await axios.post(`${Url}/user/check/Training/Availability`, data, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            if (res.data.status === 200) {
                console.log("check res", res.data);
                toast.success(res.data.message);
                setAvailabltyData(res.data.data);
                setCurrentStep(prevStep => prevStep + 1);
            } else {
                // console.log("check error ", res.data);
                toast.error(res.data.errors.msg);
            }
        } catch (error) {
            toast.error("internal server error");
            console.error("internal server error", error);
        }
    };

    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        const CalculateTotal = () => {
            if (step2Data?.totalSession && trainingDetails?.price) {
                let total = step2Data.totalSession * trainingDetails.price;
                setTotalPrice(total); // Assuming setTotalPrice updates your total price state
            }
        }
        CalculateTotal();
    }, [step2Data, trainingDetails]);


    const addToCart = async () => {
        // const Url = BaseUrl();
        const data = {
            trainingId: trainingId,
            totalPrice: totalPrice,
            // days : availablityFilldData?.days,
            // familyMember: availablityFilldData?.selectedFamilyMember?._id,
            endDate: moment(trainingDetails?.endDate).format("YYYY-MM-DD"),
            sessionTimeDuration: trainingDetails?.sessionTimeDuration,
            pricePerSession: trainingDetails?.price,
            currency: trainingDetails?.currency,
            localCountry: trainingDetails?.localCountry,
            ...formData.step1,
            ...formData.step2
        }

       
        setStep3Data(data);
       


        // try {
        //     const res = await axios.post(`${Url}/user/addTraining/to/Cart`, data, {
        //         headers: {
        //             "Authorization": `Bearer ${token}`
        //         }
        //     })

        //     if (res.data.status === 200) {
        //         console.log("check res", res.data);
        //         toast.success(res.data.message);
        //         // setCurrentStep(prevStep => prevStep + 1);
        //     } else {
        //         console.log("check error ", res.data);
        //         toast.error(res.data.errors.msg);
        //     }
        // } catch (error) {
        //     toast.error("internal server error");
        //     console.error("internal server error", error);
        // }
    }

    const handleNext = () => {
        if (currentStep === 1) {
            // console.log("Data from Step 1: ", formData);
            handleChekAvailability();
            // setCurrentStep(prevStep => prevStep + 1);

        } else if (currentStep === 2) {
            const data = {
                ...formData.step2
            }
            console.log("step 2 data", data);
            setStep2Data(data);
            setCurrentStep(prevStep => prevStep + 1);
        } else if (currentStep === 3) {
            addToCart();
            setCurrentStep(prevStep => prevStep + 1);
        } else if (currentStep === 4) {
            // handleProceedToPayment();
            // setCurrentStep(prevStep => prevStep + 1);
        } else {
            // fill card deatils and save
        }
    };


    const renderStepComponent = () => {
        switch (currentStep) {
            case 1:
                return <AvailabltyStep1 handleFormDataChange={handleFormDataChange} formData={formData.step1} />;
            case 2:
                return <AvailabltyStep2 availabltyData={availabltyData} availablityFilldData={availablityFilldData} handleFormDataChange={handleFormDataChange} />;
            case 3:
                return <AvailabltyStep3  availablityFilldData={availablityFilldData}  step2Data={step2Data}/>;
            case 4:
                return <SavedCards  step3Data={step3Data}/>;
            case 5:
                return <AddCards />;
            default:
                return <AvailabltyStep1 />;
        }
    };



    // get review list for training
    // const [reviewList, setReviewList] = useState([]);
    // console.log("review list", reviewList);


    // useEffect(() => {
    //     const fetchData = async () => {
    //       const url = BaseUrl();
    //       if (trainingId) {
    //         try {
    //           const res = await axios.get(`${url}/user/training/get-reviewList/${trainingId}`, {
    //             headers: {
    //               Authorization: `Bearer ${token}`,
    //             },
    //           });

    //           if(res.data.status === 200){
    //             setReviewList(res.data.data.reviewData); // Use this line when you want to set state
    //             //   console.log("review list", res.data); // Access the data here
    //           }else{
    //             console.log("error", res.data);
    //           }
    //         } catch (error) {
    //           console.log(error);
    //         }
    //       }
    //     };

    //     fetchData(); // Call the async function
    //   }, [trainingId, token]);


    // get promotoins for training
    // const [promotions, setPromotions] = useState([]);
    // console.log("promtions list", promotions);


    // useEffect(() => {
    //     const fetchData = async () => {
    //         const url = BaseUrl();
    //         if (trainingId) {
    //             try {
    //                 const res = await axios.get(`${url}/user/training/get-promotions/${trainingId}`, {
    //                     headers: {
    //                         Authorization: `Bearer ${token}`,
    //                     },
    //                 });

    //                 if (res.data.status === 200) {
    //                     setPromotions(res.data.data.promoData.promoList); // Use this line when you want to set state
    //                     // console.log("promtions", res.data); // Access the data here
    //                 }else{
    //                     console.log("error", res.data);
    //                 }
    //             } catch (error) {
    //                 console.log(error);
    //             }
    //         }
    //     };

    //     fetchData(); // Call the async function
    // }, [trainingId, token]);

    return (
        <div className="container-fluid bodyColor ">
            <div className="row">
                <div className="col">
                    <Sidebar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                    <SidebarSmallDevice />
                </div>
                <div className={`${mainContainerClass} main mt-3`}>
                    <ToastContainer />
                    <div className="member-dashbord ">
                        <div className="d-flex justify-content-between ">
                            <div className="d-flex align-items-center">
                                <button className="btn prev-button" onClick={handleClose}>
                                    <img src={arrow} alt="previous" />
                                </button>

                                <h4 className="ms-3">Facility details</h4>
                            </div>

                            <div>
                                <button className="btn btn-danger" onClick={handleShowAvailability}>Check Availability</button>
                            </div>
                        </div>

                        <div className="row my-4">

                            <div className="col-md-8">

                                <div className=" itemsColor p-4 rounded-4 training-dashbord" style={{ height: "36rem", overflowY: "auto", scrollbarWidth: "none" }}>

                                    <div className="d-flex justify-content-center banner2">
                                        <img src={trainingDetails?.coverImage} alt="statdiam pick" style={{ width: "876px", height: "275px", borderRadius: "8px" }} />

                                    </div>

                                    <div className="mt-3">
                                        <div className="d-flex justify-content-center align-items-center" style={{ width: "76px", height: "30px", backgroundColor: "#FBE9E9", borderRadius: "4px" }}>
                                            {/* <img src={star} alt="star" style={{ width: "16px", height: "16px" }} /> */}
                                            <p className="text-danger mb-0" style={{ fontWeight: "500", fontSize: "20px" }}>★</p>
                                            <p className="ps-2 mb-0" style={{ color: "#03061F", fontWeight: "500" }}>{trainingDetails?.rating}</p>
                                        </div>
                                    </div>

                                    <div className="mt-2">
                                        <h4>{trainingDetails?.trainingName}</h4>
                                    </div>


                                    <div className=" col-md-1  event-item  my-3 rounded-4 d-flex ">

                                        <div className="event-icons">
                                            <div className="mb-2">
                                                <div className="d-flex ">
                                                    <img src={meeting} alt="schedule" className="me-2 " style={{ width: "20px", height: "20px" }} />
                                                    <p className="mb-0">Vritual meeting</p>
                                                </div>
                                            </div>

                                            <div className="mb-2">
                                                <div className="d-flex ">
                                                    <img src={schedule} alt="schedule" className="me-2 " style={{ width: "20px", height: "20px" }} />
                                                    <p className="mb-0">{formatDate(trainingDetails?.startDate)}- {formatDate(trainingDetails?.endDate)}</p>
                                                </div>
                                            </div>

                                        </div>


                                    </div>



                                    <div>
                                        <div className="mt-3">
                                            <h4>Curriculum</h4>

                                            <p>{trainingDetails?.curriculum}</p>
                                        </div>

                                        <div className="mt-3">
                                            <div className="row  rounded-4 p-3" style={{ backgroundColor: "#FDF4F4" }}>
                                                <div className="col-md-4 col-4 border-end ">
                                                    <div className="text-center">
                                                        <h5 className="fw-bold">{trainingDetails?.proficiencyLevel}</h5>
                                                        <p className="text-muted">Proficiency level</p>
                                                    </div>
                                                    <hr className="my-4" style={{ color: "#ccc", backgroundColor: "#ccc", height: "0.5px", border: "none" }} />
                                                    <div className="text-center">
                                                        <h5 className="mt-4">{trainingDetails?.minimumSession}</h5>
                                                        <p className="text-muted">Minimum session</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 col-4 border-end">
                                                    <div className="text-center">
                                                        <h5 className="fw-bold">{trainingDetails?.ageGroupFrom} - {trainingDetails?.ageGroupTo}yr </h5>
                                                        <p className="text-muted">Age</p>
                                                    </div>
                                                    <hr className="my-4" style={{ color: "#ccc", backgroundColor: "#ccc", height: "0.5px", border: "none" }} />
                                                    <div className="text-center">
                                                        <h5 className="mt-4">{currencySymbolMap(trainingDetails?.currency)}{trainingDetails?.price}</h5>
                                                        <p className="text-muted">Price per session</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 col-4">
                                                    <div className="text-center">
                                                        <h5 className="fw-bold text-danger">{trainingDetails?.sessionTimeDuration}</h5>
                                                        <p className="text-danger">Duration</p>
                                                    </div>
                                                    <hr className="mt-4" style={{ color: "#ccc", backgroundColor: "#ccc", height: "0.5px", border: "none" }} />

                                                    {trainingDetails?.coaches.map((coach, index) => {
                                                        return (
                                                            <div className="text-center " key={index}>
                                                                <img src={coach?.profileImage} alt="Trainer " className="rounded-circle me-2" width="40" height="40" />

                                                            </div>
                                                        )
                                                    })}
                                                    <p className="text-muted text-center">Trainers</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="trainingDays ">
                                        <div className="mt-3">
                                            <h4 className="fw-600">Day of training</h4>
                                            <div className="d-flex justify-content-start mt-3">
                                                {/* Day buttons */}
                                                <span className={`mx-1 ${trainingDetails?.days?.includes("monday") ? "active" : "text-muted"}`}>M</span>
                                                <span className={`mx-1 ${trainingDetails?.days?.includes("tuesday") ? "active" : "text-muted"}`}>T</span>
                                                <span className={`mx-1 ${trainingDetails?.days?.includes("wednesday") ? "active" : "text-muted"}`}>W</span>
                                                <span className={`mx-1 ${trainingDetails?.days?.includes("thursday") ? "active" : "text-muted"}`}>T</span>
                                                <span className={`mx-1 ${trainingDetails?.days?.includes("friday") ? "active" : "text-muted"}`}>F</span>
                                                <span className={`mx-1 ${trainingDetails?.days?.includes("saturday") ? "active" : "text-muted"}`}>S</span>
                                                <span className={`mx-1 ${trainingDetails?.days?.includes("sunday") ? "active" : "text-muted"}`}>S</span>
                                            </div>
                                        </div>


                                    </div>

                                    <div className="about-us mt-4">
                                        <h4 className="fw-600">About us</h4>

                                        <div className="mt-2">
                                            <p>{trainingDetails?.facilityBranchDetails?.[0]?.about}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 faclies">
                                        <h4 className="fw-600">Facilities</h4>
                                        <div>
                                            <button className="btn btn-outline-secondary mx-3 my-2">Restroom</button>
                                            <button className="btn btn-outline-secondary mx-3 my-2">Changing room</button>
                                            <button className="btn btn-outline-secondary mx-3 my-2">Parking</button>
                                            <button className="btn btn-outline-secondary mx-3 my-2">Pantry/Food court</button>
                                            <button className="btn btn-outline-secondary mx-3 my-2">Waiting area</button>
                                            <button className="btn btn-outline-secondary mx-3 my-2">Drinking water</button>
                                            <button className="btn btn-outline-secondary mx-3 my-2">Shower</button>
                                            <button className="btn btn-outline-secondary mx-3 my-2">Locker</button>
                                            <button className="btn btn-outline-secondary mx-3 my-2">Power back up</button>
                                            <button className="btn btn-outline-secondary mx-3 my-2">Flood lights</button>
                                            <button className="btn btn-outline-secondary mx-3 my-2">Air conditioner</button>
                                            <button className="btn btn-outline-secondary mx-3 my-2">WI-fI</button>

                                        </div>
                                    </div>

                                    <div className="promotions mt-4">
                                        <h4 className="fw-600">Promotions</h4>

                                        <div className="row">
                                            <div className=" col-md-7 " >
                                                <div className="rounded-4 p-3 d-flex justify-content-between" style={{ backgroundColor: "#FDF4F4" }}>
                                                    <div>
                                                        <h4 className="text-danger">Upto 20% Off </h4>
                                                        <p>For Youth Badminton Practice</p>
                                                        <p>Promo code- <span className="fw-bold">MPOBPS</span></p>
                                                        <a href="t&c">Terms & conditons</a>
                                                    </div>

                                                    <div className="d-flex align-items-center">
                                                        <img src={trainingDetails?.sport?.selected_image} alt="" style={{ width: "100px", height: "100px" }} />
                                                    </div>
                                                </div>

                                            </div>

                                            <div className="col-md-5 " >
                                                <div className="rounded-4 p-3" style={{ backgroundColor: "#FDF4F4" }}>
                                                    <h4 className="text-danger">Upto 20% Off </h4>
                                                    <p>For Youth Badminton Practice</p>
                                                    <p>Promo code- <span className="fw-bold">MPOBPS</span></p>
                                                    <a href="t&c">Terms & conditons</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="col-md-4">

                                <div className="calender rounded-4  itemsColor p-4">

                                    {/* <Sessions /> */}

                                    <h4>All reviews</h4>

                                    <div className="reviews p-3">
                                        <div className="card  mb-3" style={{ maxWidth: '500px', backgroundColor: '#ffffff' }}>
                                            <div className="d-flex align-items-start">
                                                <img
                                                    src={review}
                                                    alt="Profile"
                                                    className="rounded-circle me-3"
                                                    style={{ width: '50px', height: '50px' }}
                                                />
                                                <div>
                                                    <h6 className="mb-0">Advit Roy</h6>
                                                    <div className="d-flex align-items-center mb-2">
                                                        <span className="me-2 text-danger">★★★★★</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* These paragraphs now start from the left */}
                                            <p className="text-muted mt-2" style={{ fontSize: '0.9rem' }}>
                                                Reviewed In New Jersey on 12th January 2023
                                            </p>
                                            <p style={{ fontSize: '0.95rem' }}>
                                                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typeset...
                                            </p>
                                        </div>
                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* check availablity */}

                        <Offcanvas show={showAvailability} onHide={handleCloseAvailability} placement="end" className="training-offcanvas">
                            <Offcanvas.Header closeButton>
                                <Offcanvas.Title>{currentStep === 4 ? 'Pay Now' : currentStep === 5 ? 'Add new card' : currentStep >= 3 ? 'Check Availability' : 'Check Availability'}</Offcanvas.Title>


                            </Offcanvas.Header>

                            {currentStep <= 3 && (
                                    <div className="step-progress d-flex justify-content-between px-2">
                                        <div className="step-item ">
                                            <div className="d-flex justify-content-center align-items-center" >
                                                <button className={` btn step ${currentStep === 1 ? 'active' : 'inactive'}`}>1</button>
                                            </div>
                                            <p >Select member</p>
                                        </div>
                                        {/* <p className="mt-1 line d-none d-sm-block">-----------</p> */}
                                        <div className="step-item text-center">
                                            <div className="d-flex justify-content-center align-items-center" >
                                                <button className={` step ${currentStep === 2 ? 'active' : 'inactive'}`}>2</button>
                                            </div>
                                            <p>Select Date & Time</p>
                                        </div>
                                        <div className="step-item text-center">
                                            <div className="d-flex justify-content-center align-items-center" >
                                                <button className={`step ${currentStep === 3 ? 'active' : 'inactive'}`}>3</button>
                                            </div>
                                            <p>Your cart</p>
                                        </div>
                                    </div>
                                )}

                            <Offcanvas.Body>
                                {/* Step progress bar */}
                               

                                {renderStepComponent()}
                            </Offcanvas.Body>

                            <div className="fixed-bottom-container">
                                <div className="d-flex justify-content-between">

                                    <button className="btn btn-danger btn-lg mx-2 mb-2" onClick={handleNext}>

                                        {currentStep === 5 ? 'Add' : currentStep >= 3 ? 'Proceed to Pay' : 'Next'}
                                    </button>

                                </div>
                            </div>
                        </Offcanvas>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainingDashBord;
