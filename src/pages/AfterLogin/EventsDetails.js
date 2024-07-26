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
import Modal from 'react-bootstrap/Modal';
import deletepick from "../../assets/afterLogin picks/events/delete.svg";
import { BaseUrl } from "../../reducers/Api/bassUrl";
import axios from "axios";
import share from "../../assets/afterLogin picks/My team/share.svg";
import pen from "../../assets/afterLogin picks/pen.png";
import EditEvent from "../../components/AfterLogin/Events/EditEvent";
import { FacebookShareButton, TwitterShareButton, LinkedinShareButton, EmailShareButton, WhatsappShareButton, } from 'react-share';
import { FacebookIcon, TwitterIcon, LinkedinIcon, EmailIcon, WhatsappIcon } from 'react-share';






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
    const user = useSelector((state) => state.auth.user.data.user);
    const currentUser = user.fullName;
    // console.log("current user ", currentUser);
    const dispatch = useDispatch();
    const location = useLocation();
    const { event } = location.state;
    const EventDetails = useSelector((state) => state.events.eventDetails);
    const [loading, setLoading] = useState(true);
    // console.log("events ", event );
    const eventId = event?._id;
    const eventIdFromStore = event?._id;
    const eventIdFromLink = location.state?.eventId;
    // console.log("event id from link", eventIdFromLink);
    // console.log("event id ", eventId, "token" , token);
    console.log("event details ", EventDetails);




    useEffect(() => {
        if (token) {
            if (eventIdFromLink) {

                setLoading(true);
                dispatch(fetchEventsDetails({ eventId: eventIdFromLink, token })).then(() => {
                    setLoading(false);
                });
            } else if (eventIdFromStore) {
                setLoading(true);
                dispatch(fetchEventsDetails({ eventId: eventIdFromStore, token })).then(() => {
                    setLoading(false);
                });
            } else {
                toast.error("Event not found");
            }
        }
    }, [token, dispatch, eventIdFromLink, eventIdFromStore]);




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

    // confirmation map or address
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

    // Delete Event
    const [showDelete, setShowDelete] = useState(false);

    const handleShowDelete = () => {
        setShowDelete(true);
    }

    const handleCloseDelete = () => {
        setShowDelete(false);
    }

    const handleDelete = async () => {
        const deleteUrl = BaseUrl();


        try {
            const res = await axios.delete(`${deleteUrl}/user/event/cancel/${eventId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (res.data.status === 200) {
                toast.success("Event deleted successfully");
                Naviaget("/EventDashBord")
            } else {
                const errorMessage = res.data.errors ? res.data.errors.msg : "Error deleting event";
                toast.error(errorMessage);
            }
        } catch (error) {
            toast.error("internal server error");
        }
    }


    // Edit event 

    const [showEditEvent, setShowEditEvent] = useState(false);
    const handleShowEditEvent = (EventDetails) => {
        setShowEditEvent(true, EventDetails);
    }

    const handleCloseEditEvent = () => {
        setShowEditEvent(false);
    }


    // Share event 
    const [shareUrl, setShareUrl] = useState('');
    const [title, setTitle] = useState('');
    const [showShareEvent, setShowShareEvent] = useState(false);
    const handleShowShareEvent = (shareUrl) => {
        setShowShareEvent(true);
        setShareUrl(shareUrl);
    }

    const handleCloseShareEvent = () => {
        setShowShareEvent(false);
    }



    const handleCopy = () => {
        // Create a temporary input element
        const tempInput = document.createElement('input');
        tempInput.value = shareUrl; // Use the share URL

        document.body.appendChild(tempInput);

        tempInput.select();
        tempInput.setSelectionRange(0, 99999); // For mobile devices

        document.execCommand('copy');


        document.body.removeChild(tempInput);


    };

    const handleShareButtonClick = (e, EventDetails) => {
        e.stopPropagation();
        const teamShareUrl = `${window.location.origin}/join-event/${EventDetails._id}`;
        const title = `Hey, we are using a new app, Sports Nerve, for our team event & activity planning. Click the link, download the app & join ${EventDetails.eventName} now!`;
        setTitle(title);
        // setCurrentTeam(EventDetails);
        handleShowShareEvent(teamShareUrl);
    };


    // invite accept and reject
    const [showEventInvite, setEventShowInvite] = useState(false);
    const handleShowEventInvite = (member) => {
        setEventShowInvite(true, member);
    }

    const handleCloseEventInvite = () => {
        setEventShowInvite(false);
    };

    useEffect(() => {
        if (EventDetails && !EventDetails.isComplete) {
            handleShowEventInvite(EventDetails)
        }
    })

    const handleInviteAccept = async (eventId , status) => {
        const inviteUrl = BaseUrl();

        let data = {
            eventId: eventId,
            status: status,

        }

        try {
            const response = await axios.post(`${inviteUrl}/user/event/request/accept-reject`, data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });




            if (response.data.status === 200) {
                toast.success("Invite Accepted successfully");
                dispatch(fetchEventsDetails({ eventId, token }));
                handleCloseEventInvite();
                // localStorage.setItem('inviteAccepted', 'true');
                
            } else {
                console.log("check error", response.data);
                const message = response.data.errors.msg;
                toast.error(message);

            }



        } catch (error) {
            console.error('Error handling invite:', error);
        }
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

                            {/* <div className="btn ">
                                <button><img src={share} alt="share button" /> Share</button>
                            </div> */}

                            <div className="me-4">

                                <button className="btn me-2 share-editEvent-btn"
                                    onClick={(e) => handleShareButtonClick(e, EventDetails)}
                                >
                                    <img src={share} alt="share button"
                                        style={{ width: "20px", height: "20px", marginRight: "5px" }}
                                    /> Share</button>


                                <button className="btn ms-2 me-4 share-editEvent-btn"
                                    onClick={() => handleShowEditEvent(EventDetails)}
                                ><img src={pen} alt="edit button"
                                    style={{ marginRight: "5px" }}
                                    />Edit</button>

                                <button className="btn cancal-btn" onClick={handleShowDelete}>Cancal</button>
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
                        ) : (
                            <div className="row my-4">

                                <div className="col-md-8">

                                    <div className=" itemsColor p-4 rounded-4 training-dashbord">

                                        <ToastContainer />
                                        <div className="container-fluid ">
                                            <div className="row">
                                                <div className="col-md-10 practice-btn">
                                                    <button className="btn  mb-3">Practice</button>
                                                    {EventDetails && EventDetails.eventName && (
                                                        <h2>{EventDetails.eventName} </h2>
                                                    )}
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
                                                                left: "50%",
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

                                        <MemberStatus eventId={eventId} />
                                    </div>

                                </div>


                                {/* Add member  */}
                                <Offcanvas show={showAddEventMember} onHide={handleCLoseAddEventMember} placement="end">
                                    <Offcanvas.Header closeButton>
                                        <Offcanvas.Title>Add member/ Team member</Offcanvas.Title>
                                    </Offcanvas.Header>

                                    <Offcanvas.Body>
                                        <AddEventMember EventDetails={EventDetails} />
                                    </Offcanvas.Body>

                                </Offcanvas>

                                {/* Delete member  */}
                                <Modal show={showDelete} onHide={handleCloseDelete} centered>
                                    <Modal.Header closeButton style={{ borderBottom: "none" }}></Modal.Header>
                                    <Modal.Body>
                                        <div className="p-5">
                                            <div className="d-flex justify-content-center">
                                                <img src={deletepick} alt="delete pick "
                                                    style={{
                                                        width: "200px"
                                                    }}
                                                />
                                            </div>

                                            <div className="text-center mt-4">
                                                <h2>Cancel Event</h2>
                                                <p className="text-muted">Do you want to cancel event ?</p>
                                            </div>

                                            <div className="d-flex justify-content-between mt-5 cancel-event-btn">
                                                <button className="btn me-2" style={{ width: "100%", border: "1px solid #ccc" }} onClick={handleCloseDelete}>No</button>
                                                <button className="btn ms-2" onClick={handleDelete}>Yes</button>
                                            </div>
                                        </div>
                                    </Modal.Body>
                                </Modal>

                                {/* Edit events */}
                                <Offcanvas show={showEditEvent} onHide={handleCloseEditEvent} placement="end">
                                    <Offcanvas.Header closeButton>
                                        <Offcanvas.Title>Edit Event</Offcanvas.Title>
                                    </Offcanvas.Header>
                                    <Offcanvas.Body>
                                        <EditEvent EventDetails={EventDetails} handleCloseEditEvent={handleCloseEditEvent} />
                                    </Offcanvas.Body>
                                </Offcanvas>

                                {/* Share event model */}

                                <Modal show={showShareEvent} onHide={handleCloseShareEvent} centered>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Share Event</Modal.Title>
                                    </Modal.Header>

                                    <Modal.Body>
                                        <div className="py-3" >
                                            {/* Facebook Share Button */}
                                            <FacebookShareButton url={shareUrl} quote={title}>
                                                <FacebookIcon size={50} round />
                                            </FacebookShareButton>

                                            {/* Twitter Share Button */}
                                            <TwitterShareButton url={shareUrl} title={title}>
                                                <TwitterIcon size={50} round />
                                            </TwitterShareButton>

                                            {/* LinkedIn Share Button */}
                                            <LinkedinShareButton url={shareUrl} title={title}>
                                                <LinkedinIcon size={50} round />
                                            </LinkedinShareButton>

                                            {/* Email Share Button */}
                                            <EmailShareButton url={shareUrl} subject={title}>
                                                <EmailIcon size={50} round />
                                            </EmailShareButton>

                                            <WhatsappShareButton url={shareUrl} title={title}>
                                                <WhatsappIcon size={50} round />
                                            </WhatsappShareButton>
                                        </div>

                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="d-flex  justify-content-between container "
                                                style={{
                                                    backgroundColor: "white",
                                                    color: "black",
                                                    borderRadius: "10px",
                                                    padding: "5px",
                                                    fontSize: "20px",
                                                }}
                                            >



                                                <div>
                                                    Copy
                                                </div>

                                                <button className="btn" onClick={handleCopy}>
                                                    <i class="fa-regular fa-copy" style={{ fontSize: "20px" }}></i>
                                                </button>

                                            </div>

                                        </div>
                                    </Modal.Body>

                                </Modal>

                                {/* invite accept and reject */}
                                <Offcanvas show={showEventInvite} onHide={handleCloseEventInvite} placement="end">
                                    <Offcanvas.Header closeButton>
                                        <Offcanvas.Title style={{ paddingLeft: "10rem" }} >

                                            <img src={logo} alt="logo" className="logo" />


                                        </Offcanvas.Title>
                                    </Offcanvas.Header>
                                    <Offcanvas.Body>
                                        <div className="invite">
                                            <div>
                                                <p>Hi "{currentUser}" We are excited to have you on team </p>
                                            </div>
                                            <div className="d-flex">
                                                <button className="btn reject me-1"
                                                    style={{
                                                        width: "100%",
                                                        color: "red",
                                                        border: "1px solid red",
                                                    }}
                                                    onClick={() => handleInviteAccept(EventDetails && EventDetails._id, 'reject')}
                                                >
                                                    Decline
                                                </button>

                                                <button className="btn btn-danger accept ms-1"
                                                    style={{ width: "100%" }}
                                                    onClick={() => handleInviteAccept(EventDetails && EventDetails._id, 'accept')}
                                                >
                                                    Accept
                                                </button>
                                            </div>
                                        </div>
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
