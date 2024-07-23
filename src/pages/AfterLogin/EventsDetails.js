import React, { useEffect, useState } from "react";
import Sidebar from "../../components/AfterLogin/Sidebar";
import SidebarSmallDevice from "../../components/AfterLogin/SidebarSmallDevice";
import arrow from "../../assets/afterLogin picks/My team/arrow.svg";
import "../../assets/Styles/AfterLogin/createTeam.css";
import "../../assets/Styles/AfterLogin/event.css";
import locationpic from "../../assets/afterLogin picks/events/location.svg";
import { useLocation, useNavigate } from "react-router-dom";
import MemberStatus from "../../components/AfterLogin/Events/MemberStatus";
import eventpick from "../../assets/afterLogin picks/home/img.png";
import { fetchEventsDetails } from "../../reducers/eventSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { formatDate, formatTime } from "../../components/Utils/dateUtils";
import logo from "../../assets/img/logo.png";
import { confirmAlert } from 'react-confirm-alert';
import { toast, ToastContainer } from "react-toastify";
import Offcanvas from "react-bootstrap/Offcanvas";
import AddEventMember from "../../components/AfterLogin/Events/AddEventMember";
import { ThreeDots } from "react-loader-spinner";





const EventDetails = () => {
    const [mainContainerClass, setMainContainerClass] = useState("col-md-11");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
        setMainContainerClass(sidebarOpen ? "col-md-11" : "col-md-10");
    };



    const Naviaget = useNavigate();

    const handleClose = () => {
        Naviaget("/EventDashBord")
    }

    const token = useSelector((state) => state.auth.user.data.user.token);
    const dispatch = useDispatch();
    const location = useLocation();
    const { event } = location.state;
    const EventDetails = useSelector((state) => state.events.eventDetails);
    const [loading, setLoading] = useState(true);
    // console.log("events ", event );
    const eventId = event?._id;

    // console.log("event id ", eventId, "token" , token);
    // console.log("event details ", EventDetails);

  

    useEffect(() => {
        console.log("useEffect called with eventId:");
        if (eventId && token) {
            setLoading(true);
            dispatch(fetchEventsDetails({eventId: eventId, token })).then(() => {
                setLoading(false);
            });
        } else {
            console.log("eventId or token not found");
        }
    }, [token, dispatch, eventId]);

   


    const formateStartTime = formatTime(EventDetails?.startTime);
    const formateEndTime = formatTime(EventDetails?.endTime);
    const formateDate = formatDate(EventDetails?.eventDate);

    const handleLocationClick = () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${EventDetails.address}`;
        window.open(url, "_blank");
    }

    const copyAddress = () => {
        const address = EventDetails.address;
        if (address) {
            navigator.clipboard.writeText(address).then(() => {
                toast.success("Address copied to clipboard");
            }).catch(err => {
                toast.error("Failed to copy address");
            })
        } else {
            toast.error("Address not found");
        }
    }

    const showConfirmation = () => {
        confirmAlert({
            // title: 'Confirmation',
            // message: 'What you want',
            buttons: [
                {
                    label: 'Open in map',
                    className: 'yes-button',
                    onClick: () => {
                        handleLocationClick();
                    }
                },
                {
                    label: 'Copy address',
                    className: 'no-button',
                    onClick: () => {
                        copyAddress();

                    },
                //   style:{
                //     backgroundColor:'green',
                    
                //   }
                }
            ]
        });
    };

    // Add member page 
    const [showAddEventMember, setShowAddEventMember] = useState(false);

    const handleShowAddEventMember = (EventDetails) => {
        // console.log("event", EventDetails);
        setShowAddEventMember(true, EventDetails);
    }

    const handleCLoseAddEventMember = () => {
        setShowAddEventMember(false);
    }



    return (
        <div className="container-fluid bodyColor ">
            <div className="row">
                <div className="col">
                    <Sidebar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                    <SidebarSmallDevice />
                </div>
                <div className={`${mainContainerClass} main mt-4`}>
                    <div className="member-dashbord">
                        <div className="d-flex  justify-content-between">
                            <div className=" d-flex">
                                <button className="btn prev-button" onClick={handleClose}>
                                    <img src={arrow} alt="previous" />
                                </button>

                                <h4 className="ms-3 mt-md-1">Event Details</h4>
                            </div>

                            <div className="me-4">
                                <button className="btn cancal-btn">Cancal</button>
                            </div>
                        </div>

                       {loading ? (
                             <div className="text-center loader flex-grow-1 d-flex justify-content-center align-items-center">
                             <ThreeDots
                                 height={80}
                                 width={80}
                                 color="green"
                                 ariaLabel="loading"
                                 wrapperStyle={{}}
                                 wrapperClass=""
                                 visible={true}
                             />
                         </div>
                       ):(
                        <div className="row my-4">

                        <div className="col-md-8">

                            <div className=" itemsColor p-4 rounded-4 training-dashbord">

                                <ToastContainer />
                                <div className="container-fluid ">
                                    <div className="row">
                                        <div className="col-md-10 practice-btn">
                                            <button className="btn  mb-3">Practice</button>
                                            <h2>Practice event for </h2>
                                            <p>You</p>

                                        </div>
                                        <div className="col-md-2 d-flex align-items-center position-relative">
                                            <img src={eventpick} alt="Event illustration" class="img-fluid" />
                                           {EventDetails && EventDetails.sport.image && (
                                             <img src={EventDetails.sport.selected_image} alt="event pick" className="img-fluid eventpick"
                                             style={{
                                                 width: "40px",
                                                 position: "absolute",
                                                 top: "50%",
                                                 left: "45%",
                                                 transform: "translate(-50%, -50%)"

                                             }}
                                         />
                                           )}
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between mt-3">
                                        <div>
                                            <h4 className="mt-4">Location</h4>
                                            {EventDetails && EventDetails.address && (
                                                <p>{EventDetails.address}</p>
                                            )}
                                        </div>

                                        <div className="d-flex align-content-end">
                                            <img src={locationpic} alt="location"
                                                style={{
                                                    width: "30px",
                                                    cursor: "pointer",
                                                }}
                                                onClick={showConfirmation}

                                            />
                                        </div>
                                    </div>

                                    <div className="my-5">
                                        <div className="row  border-top border-bottom pb-2 pt-4">
                                            <div className="col-md-6 d-flex justify-content-center">
                                                <div>
                                                    <h5>{formateDate}</h5>
                                                    <p className="text-center">Date</p>
                                                </div>
                                            </div>
                                            <div className="col-md-6 d-flex justify-content-center">
                                                <div>
                                                    <h5> {formateStartTime} - {formateEndTime}</h5>
                                                    <p className="text-center">Time</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>



                                <div className="mt-3">
                                    <h4>Notes</h4>

                                    {EventDetails && EventDetails.notes && (
                                        <p>{EventDetails.notes}</p>
                                    )}
                                </div>

                                <div className="mt-3">
                                    <h4>Event members</h4>

                                    <div className="d-flex justify-content-between">
                                        <ul className="team-members">
                                            {EventDetails && EventDetails.allMemberDetails && EventDetails.allMemberDetails.map((member, index) => (
                                                <li key={index}>
                                                    <img src={member.image || logo} alt={`Member ${index + 1}`}
                                                        style={{
                                                            width: "40px",
                                                            height: "40px",
                                                            border: "2px solid white",
                                                        }}
                                                    />
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="add-btn">
                                            <button className="btn" onClick={() => handleShowAddEventMember(EventDetails)}>Add member</button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="col-md-4">

                            <div className="calender rounded-4  itemsColor p-4">

                                <MemberStatus />
                            </div>

                        </div>

                    <Offcanvas show={showAddEventMember} onHide={handleCLoseAddEventMember} placement="end">
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title>Add member/ Team member</Offcanvas.Title>
                        </Offcanvas.Header>

                        <Offcanvas.Body>
                            <AddEventMember EventDetails={EventDetails}/>
                        </Offcanvas.Body>

                    </Offcanvas>

                    </div>
                       )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
