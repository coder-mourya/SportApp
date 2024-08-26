import React, { useEffect } from "react";
import { fetchEventsDetails } from "../../../reducers/eventSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { ThreeDots } from "react-loader-spinner";
import { useState } from "react";
import logo from "../../../assets/img/logo.png";
import { BaseUrl } from "../../../reducers/Api/bassUrl";
import axios from "axios";
import watch from "../../../assets/afterLogin picks/events/watch.svg";
import moment from "moment";
import Offcanvas from "react-bootstrap/Offcanvas";
import 'bootstrap-icons/font/bootstrap-icons.css';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from "react-router-dom";
import deletepick from "../../../assets/afterLogin picks/events/delete.svg";
import currencySymbolMap from 'currency-symbol-map';



// import Modal from 'react-bootstrap/Modal';
import { toast } from "react-toastify";
import { formatTime, formatDate } from "../../Utils/dateUtils";

const PaymentStatus = ({ eventId }) => {
    // console.log("event id in payment status ", eventId);

    const EventDetails = useSelector((state) => state.events.eventDetails);
    const token = useSelector((state) => state.auth.user.data.user.token);
    const currentUser = useSelector((state) => state.auth.user.data.user);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [yesCount, setYesCount] = useState(0);
    const [perHead, setPerHead] = useState(0);
    const [formData, setFormData] = useState({});
    const [accountDetails, setAccountDetails] = useState("");
    const user = useSelector((state) => state.auth.user.data.user);
    const Navigate = useNavigate();
    const adminCheck = EventDetails?.allMemberDetails?.find((member) => member?.memberId === user?._id);





    // fetch event details
    useEffect(() => {
        dispatch(fetchEventsDetails({ eventId: eventId, token })).then(() => {
            setLoading(false);
        });
    }, [token, dispatch, eventId]);

    // check members counts 
    useEffect(() => {
        if (EventDetails?.allMemberDetails) {
            const yesCount = EventDetails.allMemberDetails.filter(member => member.requestStatus === 2).length;
            setYesCount(yesCount);
        }
    }, [EventDetails]);

    // calculate perhead 
    useEffect(() => {
        if (EventDetails?.totalExpenses) {
            // setPerHead(EventDetails.totalExpenses / yesCount);
            let perheadCost = EventDetails?.totalExpenses / yesCount;
            setPerHead(perheadCost?.toFixed(2));
        }
    }, [EventDetails, yesCount])

    // check amount calculate 
    const [errorMessage, setErrorMessage] = useState("");
    // const [totalAmount, setTotalAmount] = useState(0);

    const validateAmount = (newTotalAmount) => {
        const totalExpenses = EventDetails.totalExpenses;

        if (newTotalAmount !== totalExpenses) {

            setErrorMessage(`Total amount entered should be equal to ${totalExpenses}`);

        } else {
            setErrorMessage("");
        }
    };


    const handleInputChange = (event, memberId) => {
        const { value } = event.target;
        const numValue = parseFloat(value) || 0;

        setFormData(prevData => ({
            ...prevData,
            [memberId]: value
        }));

        // Update the total amount entered
        const newTotalAmount = Object.values({
            ...formData,
            [memberId]: numValue
        }).reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0);

        // console.log("updated Total Amount", newTotalEnteredAmount);

        // setTotalAmount(newTotalAmount);

        validateAmount(newTotalAmount);
    }



    // Split payment 
    const [splitPayment, setSplitPayment] = useState(false);

    useEffect(() => {
        if (splitPayment) {
            const newFormData = {};
            EventDetails.allMemberDetails.forEach((member) => {
                if (member.requestStatus === 2) {
                    newFormData[member.memberId] = perHead;
                }
            });
            setFormData(newFormData);
        } else {
            setFormData({});
        }
    }, [splitPayment, perHead, EventDetails]);





    const [members, setMembers] = useState([]);
    const [reminderTimer, setReminderTimer] = useState(0);
    // console.log("timer .. ", reminderTimer);


    useEffect(() => {
        if (EventDetails && EventDetails.allMemberDetails) {
            const pendingMembers = EventDetails.allMemberDetails.filter(
                member => member.paymentReceiptStatus === 1 && member.paymentReminderCount <= 10
            );
            setMembers(pendingMembers);

            // Initialize timers for each member
            const timers = {};
            pendingMembers.forEach((member) => {
                if (member.paymentReminderTime) {
                    const reminderTime = moment(member.paymentReminderTime);
                    const endTime = reminderTime.add(5, 'minutes');
                    timers[member._id] = { endTime, timeLeft: calculateTimeLeft(endTime) };
                }
            });
            setReminderTimer(timers);

        }
    }, [EventDetails]);

    // Function to calculate the time left
    const calculateTimeLeft = (endTime) => {
        const now = moment();
        const duration = moment.duration(endTime.diff(now));
        if (duration.asSeconds() <= 0) {
            return { minutes: 0, seconds: 0 };
        }
        return {
            minutes: duration.minutes(),
            seconds: duration.seconds()
        };
    };


    // Update timers every second
    useEffect(() => {
        const interval = setInterval(() => {
            setReminderTimer((prevTimers) => {
                const updatedTimers = { ...prevTimers };
                Object.keys(updatedTimers).forEach((memberId) => {
                    updatedTimers[memberId].timeLeft = calculateTimeLeft(updatedTimers[memberId].endTime);
                });
                return updatedTimers;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);






    // reminder 

    const handleReminder = async (memberIds = []) => {
        setLoading(true);
        const reminderUrl = BaseUrl();
        let data = new FormData();
        data.append("eventId", EventDetails._id)
        data.append("memberId", memberIds);

        try {
            const res = await axios.post(`${reminderUrl}/user/event/send/payment/reminder`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })

            if (res.data.status === 200) {
                toast.success(res.data.message);
                dispatch(fetchEventsDetails({ eventId: eventId, token }));
            } else {
                // console.log("Error sending reminder:", res.data);
                const errorMessage = res.data.errors ? res.data.errors.msg : 'error sending reminder';
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error("Error sending reminder:", error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleSingleReminder = (member) => {
        if (member.paymentReminderCount < 10) {
            handleReminder([member._id]);
        } else {
            toast.error("You can not send reminder more than 3 times");
        }
    }


    // split payment 
    const handleSplitPayment = async (memberIds = []) => {
        setLoading(true);
        const Url = BaseUrl();
        let data = new FormData();
        data.append("eventId", EventDetails._id)
        data.append("memberId", memberIds);
        if (!accountDetails || accountDetails === "") {
            toast.error("Please enter account details");
            setLoading(false);
            return;
        }
        data.append("accountDetails", accountDetails);
        data.append("isSplitEqually", true);

        // console.log("reminder data ", ...data);
        // setLoading(false);
        // return;

        try {
            const res = await axios.post(`${Url}/user/event/split/payment`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })

            if (res.data.status === 200) {
                console.log("res data ", res.data);
                toast.success(res.data.message);
                dispatch(fetchEventsDetails({ eventId: eventId, token }));

            } else {
                const errorMessage = res.data.errors ? res.data.errors.msg : 'error sending reminder';
                toast.error(errorMessage);
                dispatch(fetchEventsDetails({ eventId: eventId, token }));

            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    // check payment details 

    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmMember, setConfirmMember] = useState(null);
    // console.log("check confirm member", confirmMember);



    const handleShowConfirm = (member) => {
        console.log("check member", member);
        setShowConfirm(true);
        setConfirmMember(member);
    }

    const handleCloseConfirm = () => {
        setShowConfirm(false);
    }

    const handleConfirmPayment = async () => {
        setLoading(true);
        const confirmUrl = BaseUrl();
        let data = {
            eventId: EventDetails._id,
            memberId: confirmMember._id
        }

        // console.log("check confirm data", data);
        // dispatch(fetchEventsDetails({ eventId: eventId, token }));
        // setShowConfirm(false);
        // setLoading(false);
        // return;

        try {
            const res = await axios.post(`${confirmUrl}/user/event/confirm/expensePayment`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (res.data.status === 200) {
                // console.log("res data ", res.data);
                toast.success(res.data.message);
                dispatch(fetchEventsDetails({ eventId: eventId, token }));
                setShowConfirm(false);

            } else {
                const errorMessage = res.data.errors ? res.data.errors.msg : 'error confirming payment';
                toast.error(errorMessage);


            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }



    // end event 
    const [showDelete, setShowDelete] = useState(false);

    const handleShowDelete = () => {
        setLoading(true);
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
                Navigate("/EventDashBord")
            } else {
                const errorMessage = res.data.errors ? res.data.errors.msg : "Error deleting event";
                toast.error(errorMessage);
            }
        } catch (error) {
            toast.error("internal server error");
        } finally {
            setLoading(false);
        }
    }

    const currencySymbol = EventDetails?.eventExpenses.length
        ? currencySymbolMap(EventDetails.eventExpenses[0].currencyCode) || ''
        : '';


    return (
        <div className="payment-status">
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
                <>
                    <div className="row d-flex justify-content-center mt-2">
                        <div className="col-4 text-center">
                            <h4>{currencySymbol}{EventDetails && EventDetails.totalExpenses}</h4>
                            <p>Total spend</p>
                        </div>

                        <div className="col-4 text-center">
                            <h4>{yesCount}</h4>
                            <p>Total members</p>
                        </div>

                        <div className="col-4 text-center">
                            <h4> {currencySymbol}{perHead}</h4>
                            <p>Per head</p>
                        </div>
                    </div>

                    {EventDetails.isSplitPayment !== true && (
                        <div className="d-flex justify-content-start  mt-2">
                            <input type="checkbox"
                                style={{ width: "25px", height: "25px", cursor: "pointer", borderRadius: "50%" }}
                                checked={splitPayment}
                                onChange={(e) => setSplitPayment(e.target.checked)}
                            />

                            <p className="ms-2" style={{ marginTop: "1px", fontWeight: "600" }}>Split payment</p>
                        </div>
                    )}

                    <div>
                        <label style={{ color: "#283593" }}>Account details</label>
                        {EventDetails.accountDetails ? (
                            <p>{EventDetails.accountDetails}</p>
                        ) : (
                            <input
                                type="text"
                                className="form-control py-2"
                                placeholder="Account details"
                                name="accountDetails"
                                style={{ backgroundColor: "#F4F5F9" }}
                                value={accountDetails}
                                onChange={(e) => setAccountDetails(e.target.value)}
                            />
                        )}
                    </div>

                    <div className="mt-3" >
                        <h1 style={{ fontSize: "24px" }}>Event Members</h1>

                        <div style={{
                            height: "15rem", overflowY: "auto", scrollbarWidth: "none",
                            msOverflowStyle: "none",
                        }}>
                            {EventDetails?.creatorIsAdmin && (
                                <div className="member-container col-md-12 d-flex py-3 px-3 my-3 rounded-3 bodyColor">
                                    <div className="col-2">
                                        <img src={EventDetails?.allMemberDetails?.find(member => member.memberId === EventDetails.creatorId).image || logo} alt="creator" style={{ width: "50px", height: "50px", borderRadius: "10%" }} />
                                    </div>
                                    <div className="col-6 d-flex align-items-center">
                                        <div>

                                            <p className="mb-0">{EventDetails.creatorId === currentUser._id ? "You" : EventDetails?.allMemberDetails?.find(member => member.memberId === EventDetails.creatorId).fullName}</p>

                                            {EventDetails?.allMemberDetails?.find(member => member.memberId === EventDetails.creatorId && member.paymentReceiptStatus === 2) ? (
                                                <p className="p-0 m-0 text-muted" style={{ fontSize: "12px", fontWeight: "600" }}>
                                                    {currencySymbol}{EventDetails.allMemberDetails.find(member => member.memberId === EventDetails?.creatorId && member.paymentReceiptStatus === 2).yourContribution?.toFixed(2)}
                                                </p>
                                            ) : null}

                                        </div>
                                    </div>
                                    <div className="col-4 d-flex align-items-center justify-content-end pe-2">
                                        {!EventDetails?.allMemberDetails?.find(member =>
                                            member.memberId === EventDetails.creatorId &&
                                            member.paymentReceiptStatus === 2
                                        )?.yourContribution && (
                                                <input
                                                    type="text"
                                                    name="amount"
                                                    value={formData[EventDetails.creatorId] || ""}
                                                    onChange={(e) => handleInputChange(e, EventDetails.creatorId)}
                                                    style={{ width: "60px", height: "25px", backgroundColor: "white", borderRadius: "8px", fontSize: "13px", fontWeight: "600" }}
                                                    className="form-control p-0 text-center"
                                                />
                                            )}


                                    </div>
                                </div>
                            )}

                            {EventDetails.allMemberDetails.map((member, index) => (
                                member.requestStatus === 2 && member.memberId !== EventDetails.creatorId && (
                                    <div key={index}
                                        className={`member-container col-md-12 d-flex py-3 px-3 my-3 rounded-3 bodyColor ${member.paymentReceiptStatus === 3 ? 'hoverable' : ''}`}
                                        style={member.paymentReceiptStatus === 3 ? { cursor: "pointer" } : {}}
                                        onClick={member.paymentReceiptStatus === 3 ? () => handleShowConfirm(member) : null}
                                    >
                                        <div className="col-2">
                                            <img src={member.image || logo} alt={member.name} style={{ width: "50px", height: "50px", borderRadius: "10%" }} />
                                        </div>
                                        <div className="col-6 d-flex align-items-center">
                                            <div>
                                                <p>{member.fullName}</p>
                                            </div>
                                        </div>
                                        <div className="col-4 d-flex align-items-center justify-content-end">
                                            {EventDetails?.isSplitPayment ? (
                                                <p className="p-0 m-0 mb-2 me-2 text-bold">{currencySymbol}{member.yourContribution?.toFixed(2)}</p>
                                            ) : (
                                                <input
                                                    type="text"
                                                    name="amount"
                                                    value={formData[member.memberId] || ""}
                                                    onChange={(e) => handleInputChange(e, member.memberId)}
                                                    style={{ width: "60px", height: "25px", backgroundColor: "white", borderRadius: "8px", fontSize: "13px", fontWeight: "600" }}
                                                    className="form-control me-2 p-0 text-center"
                                                />
                                            )}

                                            {EventDetails && EventDetails?.isSplitPayment ? (
                                                <div className="d-flex justify-content-end align-items-center position-relative mt-2 me-2">
                                                    <p className="cownDown">
                                                        {reminderTimer[member._id] && reminderTimer[member._id].timeLeft.minutes > 0 ? (
                                                            // Timer is running
                                                            `${reminderTimer[member._id].timeLeft.minutes}:${reminderTimer[member._id].timeLeft.seconds}`
                                                        ) : member.paymentReceiptStatus === 2 ? (
                                                            // Payment confirmed
                                                            <p style={{ cursor: "pointer", marginBottom: "0" }} onClick={() => handleShowConfirm(member)}>Confirm</p>
                                                        ) : member.paymentReceiptStatus === 3 ? (
                                                            <p className="text-center" style={{ marginBottom: "0", width: "25px", height: "25px", borderRadius: "50%", backgroundColor: "#7AD377", color: "white" }}>&#10003;</p>
                                                        ) : (
                                                            // Timer is not running, show count and watch image
                                                            <div className="me-0">
                                                                <div className="text-center"
                                                                    style={{
                                                                        position: "absolute",
                                                                        bottom: "50%",
                                                                        left: "55%",
                                                                        width: "25px",
                                                                        height: "25px",
                                                                        borderRadius: "50%",
                                                                        backgroundColor: "#283593",
                                                                        color: "white",
                                                                    }}
                                                                >
                                                                    <p className="text-center">{member.paymentReminderCount || 0}</p>
                                                                </div>

                                                                <img src={watch} alt="watch" style={{ width: "25px", cursor: "pointer" }}
                                                                    onClick={() => handleSingleReminder(member)}
                                                                />
                                                            </div>
                                                        )}
                                                    </p>
                                                </div>
                                            ) : null}
                                            {member.paymentReceiptStatus === 3 ? (
                                                <p className="pt-2 text-muted">
                                                    <i className="bi bi-chevron-right "></i>
                                                </p>
                                            ) : (
                                                null
                                            )}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>


                        {errorMessage && <p className="text-danger">{errorMessage}</p>}
                    </div>
                </>
            )}





            {!EventDetails?.isSplitPayment ? (
                <div className="download-list d-flex justify-content-center mt-5">
                    <button
                        className="btn py-2"
                        onClick={() => handleSplitPayment(members.map(member => member._id))}
                    >
                        Send
                    </button>
                </div>
            ) : (
                <div className="download-list d-flex justify-content-center mt-5">
                    {EventDetails?.allMemberDetails?.some((member) => (member.paymentReceiptStatus === 1 || member.paymentReceiptStatus === 2)) &&
                        !EventDetails?.allMemberDetails
                            ?.filter((member) => !member.isAdmin) // Exclude admin members
                            .every((member) => member.paymentReceiptStatus === 3) ? (
                        <button
                            className="btn py-2"
                            onClick={() => handleReminder(members.map(member => member._id))}
                        >
                            Remind All
                        </button>
                    ) : (
                        <button
                            className="btn py-2"
                            onClick={handleShowDelete}
                        >
                            End Event
                        </button>
                    )

                    }

                </div>
            )}

            {/* confirm payment */}

            <Offcanvas show={showConfirm} onHide={handleCloseConfirm} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title> Payment Deatils</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <div className="p-2 " style={{ display: "flex", flexDirection: "column", height: "39rem" }}>
                        <div className="row rounded-4 d-flex justify-content-center align-items-center py-2" style={{ border: "0.5px solid #ccc" }}>
                            <div className="col-md-2" >
                                <img src={confirmMember?.image || logo} alt="logo" style={{ width: "60px", height: "60px", borderRadius: "10%" }} />
                            </div>

                            <div className="col-md-10 ">
                                <h3 className="ms-2" style={{ fontSize: "20px" }}>{confirmMember && confirmMember.fullName}</h3>
                                <p className="text-muted ms-2">${confirmMember && confirmMember.expenseContribution?.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <p>{confirmMember && confirmMember.paymentNotes}</p>
                        </div>

                        <div className="mt-2 d-flex justify-content-start" >

                            <p className="ms-2 text-muted">{formatDate(confirmMember?.paymentReceiptUploadTime)}</p>
                            <p className="ms-2 text-muted">at</p>
                            <p className="ms-2 text-muted">{formatTime(confirmMember?.paymentReceiptUploadTime)}</p>
                        </div>
                        <div><p>ScreenShots :-</p></div>
                        <div className="d-flex justify-content-center p-2" style={{ overflowX: "auto" }}>
                            <img src={confirmMember && confirmMember.paymentScreenshots.map((screenshot) => screenshot)}
                                alt="payment screenshots"
                                style={{ width: "300px", height: "200px" }}
                            />
                        </div>

                        <div className="mt-auto">
                            {confirmMember?.paymentReceiptStatus !== 3 ? (
                                <button className="btn btn-danger" onClick={handleConfirmPayment} style={{ width: "100%" }} type="button">Confirm</button>
                            ) : (
                                null
                            )}
                        </div>
                    </div>
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

        </div>
    )
}

export default PaymentStatus