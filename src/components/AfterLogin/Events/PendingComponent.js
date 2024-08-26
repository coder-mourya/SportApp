import { React, useEffect } from "react";
import { fetchEventsDetails } from "../../../reducers/eventSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { ThreeDots } from "react-loader-spinner";
import { useState } from "react";
import logo from "../../../assets/img/logo.png";
import { toast } from "react-toastify";
import { BaseUrl } from "../../../reducers/Api/bassUrl";
import axios from "axios";
import moment from "moment";
import watch from "../../../assets/afterLogin picks/events/watch.svg";



const PendingComponent = ({ eventId }) => {

    const EventDetails = useSelector((state) => state.events.eventDetails);
    const token = useSelector((state) => state.auth.user.data.user.token);
    const user = useSelector((state) => state.auth.user.data.user);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState([]);
    // reminder count  and Reminder timer 
    const [reminderTimer, setReminderTimer] = useState(0);
    // console.log("reminder time in pending component ", reminderTimer);
    const adminCheck = EventDetails?.allMemberDetails?.find((member) => member?.memberId === user?._id);


    // fetch event details
    useEffect(() => {
        dispatch(fetchEventsDetails({ eventId: eventId, token })).then(() => {
            setLoading(false);
        });
    }, [token, dispatch, eventId]);

    // get All members 

    useEffect(() => {
        if (EventDetails && EventDetails.allMemberDetails) {
            const pendingMembers = EventDetails.allMemberDetails.filter(
                member => member.requestStatus === 1 && member.confirmationReminderCount <= 3
            );
            setMembers(pendingMembers);

            // Initialize timers for each member
            const timers = {};
            pendingMembers.forEach((member) => {
                if (member.confirmationReminderTime) {
                    const reminderTime = moment(member.confirmationReminderTime);
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


    const handleReminder = async (memberIds = []) => {
        setLoading(true);
        if(!adminCheck?.isAdmin){
            toast.error("You are not authorized to send reminder");
            setLoading(false);
            return;
        }
        const reminderUrl = BaseUrl();
        let data = new FormData();
        data.append("eventId", EventDetails._id)
        data.append("memberId", memberIds);
        console.log("reminder data ", ...data);
        // return


        try {
            const res = await axios.post(`${reminderUrl}/user/event/send/request/reminder/join`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                }
            })

            console.log("response from reminder", res);

            if (res.data.status === 200) {
                dispatch(fetchEventsDetails({ eventId: eventId, token }));
                console.log(res.data);
                toast.success(res.data.message);
            } else {
                const errorMeasage = res.data.errors ? res.data.errors.msg : "Something went wrong";
                console.log(res.data);
                toast.error(errorMeasage);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }



    const handleSingleReminder = (member) => {
        if(!adminCheck?.isAdmin){
            toast.error("You are not authorized to send reminder");
        }else{
            if(member.confirmationReminderCount < 3){
                handleReminder([member._id]);
            }else{
                toast.error("You can not send reminder more than 3 times");
            }
        }
    }

    // const handleAllReminder = (member) => {
    //     if(!adminCheck?.isAdmin){
    //         toast.error("You are not authorized to send reminder");
    //     }else{
    //         if(member.confirmationReminderCount < 3){
    //             handleReminder([member._id]);
    //         }else{
    //             toast.error("You can not send reminder more than 3 times");
    //         }
    //     }
    // }


    return (
        <div className=" ">
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
                <div className="row pending-component d-flex justify-content-center">
                    {EventDetails.allMemberDetails.map((member, index) => (

                        member.requestStatus === 1 && (
                            <div key={index} className="member-container col-md-12 d-flex  row py-2 my-2 bodyColor rounded-3">
                                <div className="col-2">
                                    <img src={member.image || logo} alt={member.name}
                                        style={{
                                            width: "50px",
                                            height: "50px",
                                            borderRadius: "10%",

                                        }}
                                    />
                                </div>
                                <div className=" d-flex align-items-center col-8">

                                    <p className="text-start ms-3">{member.fullName}</p>
                                </div>

                                <div className="d-flex justify-content-end align-items-center col-2 position-relative mt-2">
                                    <p className="cownDown">
                                        {reminderTimer[member._id] && reminderTimer[member._id].timeLeft.minutes > 0 ? (
                                            // Timer is running
                                            `${reminderTimer[member._id].timeLeft.minutes}:${reminderTimer[member._id].timeLeft.seconds}`
                                        ) : (
                                            // Timer is not running, show count and watch image
                                            <>
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
                                                    <p className="text-center">{member.confirmationReminderCount || 0}</p>
                                                </div>
                                                <img src={watch} alt="watch" style={{ width: "25px", cursor: "pointer" }}
                                                    onClick={() => handleSingleReminder(member)}
                                                />
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )
                    ))}
                </div>

            )}

            <div className="download-list mt-4 d-flex justify-content-center">
                <button className="btn" onClick={() => handleReminder(members.map(member => member._id))}>
                    Remind All
                </button>
            </div>
        </div>
    )
}

export default PendingComponent;