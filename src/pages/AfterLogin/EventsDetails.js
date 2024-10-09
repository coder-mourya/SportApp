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
import defaultLogo from "../../assets/img/logo.png";
import { toast, ToastContainer } from "react-toastify";
import Offcanvas from "react-bootstrap/Offcanvas";
import AddEventMember from "../../components/AfterLogin/Events/AddEventMember";
import { ThreeDots } from "react-loader-spinner";
import Modal from 'react-bootstrap/Modal';
import deletepick from "../../assets/afterLogin picks/events/delete.svg";
import payment from "../../assets/afterLogin picks/events/payment.svg";
import { BaseUrl } from "../../reducers/Api/bassUrl";
import axios from "axios";
import share from "../../assets/afterLogin picks/My team/share.svg";
import pen from "../../assets/afterLogin picks/pen.png";
import EditEvent from "../../components/AfterLogin/Events/EditEvent";
import { FacebookShareButton, TwitterShareButton, LinkedinShareButton, EmailShareButton, WhatsappShareButton, } from 'react-share';
import { FacebookIcon, TwitterIcon, LinkedinIcon, EmailIcon, WhatsappIcon } from 'react-share';
import Status from "../../components/AfterLogin/Events/Status";
import Payment from "../../components/AfterLogin/Events/Payment";
import uploadIcon from "../../assets/afterLogin picks/My team/upload-icon.svg";
import { useRef } from "react";
import logoIcon from "../../assets/img/logo.png";
import { fetchSchedule } from "../../reducers/scheduleSlice";
import currencySymbolMap from 'currency-symbol-map';
import ChatBox from "../../components/AfterLogin/Chats/ChatBox";





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
    // console.log("current user ", user);
    const dispatch = useDispatch();
    const location = useLocation();
    const { event } = location.state;
    const { ScheduleEvent } = location.state;
    // console.log("event from shedule ", ScheduleEvent);

    const eventIdFromShedule = ScheduleEvent?.event?._id || ScheduleEvent?._id;

    const EventDetails = useSelector((state) => state.events.eventDetails);
    const [loading, setLoading] = useState(true);
    // console.log("events ", event );
    const eventId = event?._id;
    const eventIdFromStore = event?._id;
    const eventIdFromLink = location.state?.eventId;
    // console.log("event id from link", eventIdFromLink);
    // console.log("event id ", eventId, "token" , token);
    // console.log("event details ", EventDetails);

    const adminCheck = EventDetails?.allMemberDetails?.find((member) => member?.memberId === user?._id);


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
            } else if (eventIdFromShedule) {
                setLoading(true);
                dispatch(fetchEventsDetails({ eventId: eventIdFromShedule, token })).then(() => {
                    setLoading(false);
                });
            } else {
                toast.error("Event not found");
            }
        }
    }, [token, dispatch, eventIdFromLink, eventIdFromStore, eventIdFromShedule]);


    const formateEndTime = formatTime(event?.endTime, event?.location?.coordinates[1], event?.location?.coordinates[0]);
    const formateStartTime = formatTime(event?.startTime, event?.location?.coordinates[1], event?.location?.coordinates[0]);
    const formateDate = formatDate(EventDetails?.eventDate);


    // confirmation map or address

    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleShowConfirmation = () => {
        setShowConfirmation(true);
    }
    const handleCLoseConfirmation = () => {
        setShowConfirmation(false);
    }

    const handleLocationClick = () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${EventDetails.address}`;
        window.open(url, "_blank");
    }

    const copyAddress = () => {
        const address = EventDetails.address;
        if (address) {
            navigator.clipboard.writeText(address).then(() => {
                toast.success("Address copied to clipboard");
                handleCLoseConfirmation();

            }).catch(err => {
                toast.error("Failed to copy address");
            })
        } else {
            toast.error("Address not found");
        }
    }


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

        if (!adminCheck?.isAdmin) {
            toast.error("You are not authorized to delete this event");
        } else {
            setShowDelete(true);
        }
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
        if (!adminCheck?.isAdmin) {
            toast.error("You are not authorized to edit this event");
        } else {
            setShowEditEvent(true, EventDetails);
        }
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
    const [invitedMember, setInvitedMember] = useState({});
    const [inviteAccepted, setInviteAccepted] = useState(false);
    const handleShowEventInvite = (member) => {
        setEventShowInvite(true);
        setInvitedMember(member);
    }

    const handleCloseEventInvite = () => {
        setEventShowInvite(false);
    };

    const currentUserId = user._id;
    // console.log("currentUserId", currentUserId);

    useEffect(() => {
        // const inviteAccepted = localStorage.getItem('inviteAccepted');

        if (EventDetails && EventDetails.allMemberDetails) {
            const pendingMember = EventDetails.allMemberDetails.find(
                member => member.requestStatus === 1 && member.memberId === currentUserId
            );

            if (!inviteAccepted && eventIdFromLink) {
                handleShowEventInvite(pendingMember);
                console.log("first 1");
            } else if (!inviteAccepted && eventIdFromLink && pendingMember) {
                handleShowEventInvite(pendingMember);
                console.log("secound 2");
            } else if (pendingMember) {
                handleShowEventInvite(pendingMember);
                console.log("third 3");
            }

        }
    }, [EventDetails, eventIdFromLink, currentUserId, inviteAccepted]);

    const handleInviteAccept = async (status) => {
        setLoading(true)
        const inviteUrl = BaseUrl();
        const EventId = EventDetails?._id;
        let data = {
            eventId: EventId,
            status: status,
        }





        if (invitedMember?._id) {
            data["memberId"] = invitedMember?._id
        }

        // console.log("check data", data);
        // setLoading(false)
        // return


        try {
            const response = await axios.post(`${inviteUrl}/user/event/request/accept-reject`, data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });




            if (response.data.status === 200) {
                toast.success("Invite Accepted successfully");
                const getCurrentISODateTime = (date) => {
                    if (!date) return null;
                    let originalDate = new Date(date);
                    if (isNaN(originalDate.getTime())) return null;

                    const isoDateTime = `${originalDate.getFullYear()}-${(originalDate.getMonth() + 1)
                        .toString()
                        .padStart(2, '0')}-${originalDate.getDate()
                            .toString()
                            .padStart(2, '0')}T${originalDate.getHours()
                                .toString()
                                .padStart(2, '0')}:${originalDate.getMinutes()
                                    .toString()
                                    .padStart(2, '0')}:${originalDate.getSeconds()
                                        .toString()
                                        .padStart(2, '0')}.${originalDate.getMilliseconds()
                                            .toString()
                                            .padStart(3, '0')}Z`;

                    return isoDateTime;
                };

                const formattedDate = getCurrentISODateTime(new Date());

                dispatch(fetchSchedule({ token, date: formattedDate }))
                dispatch(fetchEventsDetails({ eventId: EventId, token }));
                handleShowEventInvite(false);
                window.location.reload();
                setInviteAccepted(true);
            } else {
                console.log("check error", response.data);
                const message = response.data.errors.msg;
                toast.error(message);

            }



        } catch (error) {
            console.error('Error handling invite:', error);
        } finally {
            setLoading(false)
        }
    }

    // event type 
    const eventType = EventDetails?.eventType.charAt(0).toUpperCase() + EventDetails?.eventType.slice(1);

    // console.log("event type", eventType);


    // handle add recipient
    const [showAddreceipt, setShowAddreceipt] = useState(false);
    const [paymentScreenshots, setPaymentScreenshots] = useState(null);
    const logoInputRef = useRef(null);
    const [formData, setFormData] = useState({
        eventId: "",
        memberId: "",
        notes: "",
        paymentScreenshots: "",
    })
    const handleShowAddreceipt = () => {
        setShowAddreceipt(true);
    }
    const handleCloseAddreceipt = () => {
        setShowAddreceipt(false);
    }

    const handleLogoSelect = () => {
        logoInputRef.current.click();
    }

    const handleLogo = (e) => {
        const file2 = e.target.files[0];

        if (file2) {
            setPaymentScreenshots(URL.createObjectURL(file2))
            setFormData((prevFormData) => ({
                ...prevFormData,
                paymentScreenshots: file2,
            }));
        }
    }

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };
    const currentUserMember = EventDetails?.allMemberDetails.find((member) => member.memberId === user._id);
    const currentUserMemberId = currentUserMember?._id;
    // console.log("memberId", currentUsermemberId);



    const handleAddRecipient = async (e) => {
        e.preventDefault();
        setLoading(true);
        const addMemberUrl = BaseUrl();
        const formDataToSend = new FormData();
        formDataToSend.append('eventId', eventId);
        formDataToSend.append('memberId', currentUserMemberId);
        formDataToSend.append('notes', formData.notes);
        formDataToSend.append('paymentScreenshots', formData.paymentScreenshots);
        formDataToSend.append('paymentReceiptUploadTime', new Date().toISOString());
        // console.log("check data", ...formDataToSend);
        // setLoading(false);
        // return;


        try {
            const res = await axios.post(`${addMemberUrl}/user/event/add/receipt`, formDataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (res.data.status === 200) {
                dispatch(fetchEventsDetails({ eventId, token }));
                // console.log("check res", res.data);
                const message = res.data.message
                toast.success(message)
                handleCloseAddreceipt()
            } else {
                // console.log("check error", res.data);

                const errorMessage = res.data.errors ? res.data.errors.msg : 'error adding member';
                toast.error(errorMessage)
            }
        } catch (error) {
            console.error("Error adding member:", error);
        } finally {
            setLoading(false);
        }
    }




    // render component conditionally
    const [selectedCompo, setSelectedCompo] = useState("MemberStatus");

    const handleOptionChange = (option) => {
        setSelectedCompo(option);
    };

    const renderComponent = () => {
        switch (selectedCompo) {
            case "Status":
                return <Status eventId={eventId} />;
            case "Payment":
                return <Payment eventId={eventId} />;
            default:
                return <MemberStatus eventId={eventId} />;
        }
    }

    const currencySymbol = EventDetails?.eventExpenses.length
        ? currencySymbolMap(EventDetails.eventExpenses[0].currencyCode) || ''
        : '';

    return (
        <div className="container-fluid bodyColor ">
            <div className="row">
                <div className="col">
                    <Sidebar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                    <SidebarSmallDevice />
                </div>
                <div className={`${mainContainerClass} main`}>

                    <div className="member-dashbord">

                        <div className="row bodyColor py-md-4 py-3" style={{ position: "sticky", top: "9%", zIndex: "1" }}>
                            <div className="d-flex col-md-6 col-4 justify-content-center justify-content-sm-start align-items-center">
                                <button className="btn prev-button d-flex justify-content-center align-items-center" onClick={handleClose}
                                    style={{ height: "40px", width: "40px", }}
                                >
                                    <img src={arrow} alt="previous" />
                                </button>

                                <h4 className="ms-3 mt-1 event-details-heading">Event Details</h4>
                            </div>



                            <div className="event-details-btns col-md-6 col-8 d-flex justify-content-end align-items-center pe-4 " >
                                <button className="btn me-2 share-editEvent-btn"
                                    onClick={(e) => handleShareButtonClick(e, EventDetails)}
                                >
                                    <img src={share} alt="share button"
                                        style={{ width: "20px", height: "20px", marginRight: "5px" }}
                                    /> Share</button>


                                {EventDetails && !EventDetails.allMemberDetails.some((member) => member.requestStatus === 2 && member.memberId !== EventDetails.creatorId) && (
                                    <button className="btn ms-2 me-4 share-editEvent-btn"
                                        onClick={() => handleShowEditEvent(EventDetails)}
                                    >
                                        <img src={pen}
                                            alt="edit button"
                                            style={{ marginRight: "5px" }}
                                        />
                                        Edit
                                    </button>
                                )}



                                {EventDetails && (
                                    EventDetails.totalExpenses === 0 ? (
                                        <button className="btn cancal-btn" onClick={handleShowDelete}>Cancal</button>

                                    ) : (

                                        user._id === EventDetails.creatorId ? (
                                            <button className={`btn payment-btn ${selectedCompo === "Payment" ? "active" : ""}`}
                                                onClick={() => handleOptionChange("Payment")}

                                            >
                                                {EventDetails.isSplitPayment ? "Payment Status" : "Split Payment"}
                                            </button>
                                        ) : (

                                            EventDetails?.isSplitPayment ? (
                                                <button className="btn btn-danger"
                                                    onClick={() => handleShowAddreceipt()}
                                                >Confirm Payment</button>
                                            ) : null
                                        )
                                    )
                                )}

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
                            <div className="row mb-4">

                                <div className="col-md-8">

                                    <div className=" itemsColor p-4 rounded-4 training-dashbord"
                                        style={{
                                            height: "41rem",
                                            overflow: "auto",
                                            scrollbarWidth: "none",
                                            msOverflowStyle: "none",
                                        }}
                                    >

                                        <ToastContainer />
                                        <div className="container-fluid ">
                                            <div className="row">
                                                <div className="col-md-10 practice-btn">
                                                    <button className="btn  mb-3">{eventType} </button>
                                                    {EventDetails && EventDetails.eventName && (
                                                        <h2>{EventDetails.eventName} </h2>
                                                    )}
                                                    <p>You</p>

                                                </div>
                                                <div className="col-md-2 d-flex align-items-center justify-content-center position-relative">
                                                    <img src={eventpick} alt="Event illustration" className="img-fluid" />
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
                                                        onClick={handleShowConfirmation}

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



                                        <div className="mt-2">
                                            <h4>Notes</h4>

                                            {EventDetails && EventDetails.notes && (
                                                <p>{EventDetails.notes}</p>
                                            )}
                                        </div>

                                        {EventDetails && EventDetails.creatorId !== user._id ? (
                                            EventDetails?.isSplitPayment ? (
                                                <>
                                                    <div className="d-flex  align-items-center">
                                                        <p className="me-3" style={{ fontWeight: "600" }}>Account details :-</p>
                                                        <p>{EventDetails && EventDetails.accountDetails}</p>
                                                    </div>

                                                    {EventDetails?.allMemberDetails?.find((member) => member.memberId === user._id)?.paymentReceiptStatus === 1 ? (
                                                        <div className="d-flex justify-content-center align-items-center rounded-4 py-4" style={{ backgroundColor: "#FDF4F4", border: "1px dashed #EDACAC" }}>
                                                            <div>
                                                                <h3 className="text-center text-danger">{currencySymbol}{EventDetails.allMemberDetails.find((member) => member.memberId === user._id)?.yourContribution?.toFixed(2)}</h3>
                                                                <p>Your contribution</p>
                                                            </div>
                                                        </div>
                                                    ) : EventDetails?.allMemberDetails?.find((member) => member.memberId === user._id)?.paymentReceiptStatus === 2 ? (
                                                        <>
                                                            <div className="d-flex justify-content-center align-items-center rounded-4 py-5" style={{ backgroundColor: "#FDF4F4", border: "1px dashed #EDACAC" }}>
                                                                <div>

                                                                    <p className="text-danger">Payment confirmation pending</p>
                                                                </div>
                                                            </div>

                                                            <div className="d-flex justify-content-center mt-2">
                                                                <img src={EventDetails?.allMemberDetails?.find((member) => member.memberId === user._id)?.paymentScreenshots} alt=""
                                                                    style={{ width: "300px", height: "300px" }}
                                                                />

                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div >
                                                            <div className="d-flex justify-content-center">

                                                                <img src={payment} alt="payment" />
                                                            </div>
                                                            <p className="text-center">Payment done</p>
                                                        </div>
                                                    )}

                                                </>
                                            ) : (
                                                <div className="mt-3">
                                                    <h4>Event members</h4>

                                                    <div className="d-flex justify-content-between">
                                                        <ul className="team-members">
                                                            {EventDetails && EventDetails.allMemberDetails && EventDetails.allMemberDetails.map((member, index) => (
                                                                <li key={index}>
                                                                    <img src={member.image || defaultLogo} alt={`Member ${index + 1}`}
                                                                        style={{
                                                                            width: "40px",
                                                                            height: "40px",
                                                                            border: "2px solid white",
                                                                        }}
                                                                    />
                                                                </li>
                                                            ))}
                                                        </ul>


                                                    </div>
                                                </div>
                                            )
                                        ) : (
                                            <div className="mt-3">
                                                <h4>Event members</h4>

                                                <div className="d-flex justify-content-between">
                                                    <ul className="team-members ms-2">
                                                        {EventDetails && EventDetails.allMemberDetails && EventDetails.allMemberDetails.map((member, index) => (
                                                            <li key={index}>
                                                                <img src={member.image || defaultLogo} alt={`Member ${index + 1}`}
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
                                        )}

                                    </div>
                                </div>

                                <div className="col-md-4">

                                    <div className="sideContainer rounded-4  itemsColor py-4 px-2" style={{ height: "41rem" }}>

                                        {EventDetails && EventDetails.creatorId !== user._id ? (
                                            EventDetails?.isSplitPayment ? (
                                                <div style={{ height: "42rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                                    <h2 className="ms-1" style={{ fontSize: "28px", fontWeight: "600" }}>All expenses</h2>

                                                    {EventDetails && EventDetails.eventExpenses.map((expense) => (
                                                        <div style={{ overflowY: "auto" }}>
                                                            <div className="d-flex justify-content-between mt-3 px-2" >
                                                                <p>{expense.title}</p>
                                                                <p>{currencySymbol}{expense.cost}</p>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <div className="d-flex justify-content-between px-2 mt-auto " style={{ marginBottom: "4rem" }}>
                                                        <p style={{ fontWeight: "600" }}>Total</p>
                                                        <p>{currencySymbol}{EventDetails.totalExpenses}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                renderComponent()

                                            )
                                        ) : (
                                            renderComponent()
                                        )}
                                    </div>

                                    <ChatBox eventId={eventId}/>

                                </div>

                                {/* location copy modal */}

                                <Modal show={showConfirmation} onHide={handleCLoseConfirmation} centered>
                                    <Modal.Header closeButton style={{ borderBottom: "none" }}>
                                        <Modal.Title>Location</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <div className="d-flex justify-content-center expence-delete-btn">
                                            <button onClick={copyAddress} className="btn border-success me-2 "
                                                style={{
                                                    width: "100%",
                                                }}
                                            >Copy</button>
                                            <button onClick={handleLocationClick} className="btn border-danger ms-2"
                                                style={{
                                                    width: "100%",
                                                }}
                                            >Open in map</button>
                                        </div>

                                    </Modal.Body>
                                </Modal>


                                {/* Add member  */}
                                <Offcanvas show={showAddEventMember} onHide={handleCLoseAddEventMember} placement="end">
                                    <Offcanvas.Header closeButton>
                                        <Offcanvas.Title>Add member/ Team member</Offcanvas.Title>
                                    </Offcanvas.Header>

                                    <Offcanvas.Body>
                                        <AddEventMember EventDetails={EventDetails} handleCLoseAddEventMember={handleCLoseAddEventMember} />
                                    </Offcanvas.Body>

                                </Offcanvas>

                                {/* Delete event  */}
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

                                            <img src={logoIcon} alt="logo" className="logo" />


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
                                                    onClick={() => handleInviteAccept('reject')}
                                                >
                                                    Decline
                                                </button>

                                                <button className="btn btn-danger accept ms-1"
                                                    style={{ width: "100%" }}
                                                    onClick={() => handleInviteAccept('accept')}
                                                >
                                                    Accept
                                                </button>
                                            </div>
                                        </div>
                                    </Offcanvas.Body>

                                </Offcanvas>

                                {/* add recipt */}

                                <Modal show={showAddreceipt} onHide={handleCloseAddreceipt} centered>
                                    <Modal.Header closeButton style={{ borderBottom: "none" }}>
                                        <Modal.Title>Add Receipt</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <div >
                                            <div className="d-flex justify-content-between">
                                                <h2 style={{ fontSize: "20px", fontWeight: "500" }}>Your contribution</h2>
                                                <h2 style={{ fontSize: "20px", fontWeight: "500" }}>{currencySymbol}{EventDetails?.allMemberDetails?.find((member) => member.memberId === user._id)?.yourContribution?.toFixed(2)}</h2>

                                            </div>

                                            <div>
                                                <form >
                                                    <div className="mt-2 mb-4">
                                                        <input type="text"
                                                            className="form-control py-2"
                                                            placeholder="Enter Amount"
                                                            name="amount"
                                                            value={formData.amount}
                                                            onChange={handleInputChange}
                                                            style={{ backgroundColor: "#F4F5F9" }}
                                                        />
                                                    </div>

                                                    <div className="my-3">
                                                        <input type="text"
                                                            className="form-control py-2"
                                                            placeholder="Add note"
                                                            name="notes"
                                                            value={formData.notes}
                                                            onChange={handleInputChange}
                                                            style={{ backgroundColor: "#F4F5F9" }}
                                                        />
                                                    </div>

                                                    <div className="d-flex align-items-center" onClick={handleLogoSelect}>

                                                        <div className="logo-icon">
                                                            {paymentScreenshots ? (
                                                                <img src={paymentScreenshots} alt="logo" className="img-fluid border-4" style={{
                                                                    width: "58px",
                                                                    height: "58px",
                                                                    cursor: "pointer",
                                                                    borderRadius: "8px"
                                                                }} />
                                                            ) : (
                                                                <img src={uploadIcon} alt="upload icon"
                                                                    style={{
                                                                        width: "58px",
                                                                        height: "58px",
                                                                        cursor: "pointer"
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                        <p className="ms-2 mt-2" style={{ color: "#283593", cursor: "pointer" }}>Add Screenshot</p>

                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            ref={logoInputRef}
                                                            style={{ display: "none" }}
                                                            onChange={handleLogo}
                                                        />
                                                    </div>
                                                </form>

                                                <div className="d-flex justify-content-center mt-4">
                                                    <button className="btn py-2 me-2" style={{ width: "100%", border: "1px solid #9A9BA5" }} onClick={handleCloseAddreceipt}>Cancel</button>
                                                    <button className="btn py-2 ms-2" style={{ width: "100%", backgroundColor: "#D32F2F", color: "white" }}
                                                        onClick={handleAddRecipient}
                                                    >Confirm</button>
                                                </div>
                                            </div>
                                        </div>
                                    </Modal.Body>
                                </Modal>

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
