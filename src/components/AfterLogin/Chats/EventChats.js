import React, { useEffect, useState } from 'react';

import "../../../assets/Styles/AfterLogin/chatbox.css"
// import { useDispatch } from 'react-redux';
// import { fetchEventsDetails } from '../../../reducers/eventSlice';
import { useSelector } from 'react-redux';
// import { BaseUrl } from '../../../reducers/Api/bassUrl';
import paperPlan from "../../../assets/afterLogin picks/events/paperplan.svg"
// import chatBackground from "../../../assets/afterLogin picks/events/chatBackground.png"
// import { formatTime, formatDate } from '../../Utils/dateUtils';
import { getCurrentISODateTime } from "../../Utils/dateUtils";
import socketService from "./WebSocketService";
import profile from "../../../assets/afterLogin picks/home/profile.jpg";
import schedule from "../../../assets/afterLogin picks/home/schedule.png";
import watch from "../../../assets/afterLogin picks/home/watch.png";
import moment from 'moment';
import ChatImage from './ChatImage';
import ChatVideo from './ChatVideo';
import ChatDocs from './ChatDocs';
import paperClip from "../../../assets/afterLogin picks/events/paperclip.svg"
import "../../../assets/Styles/AfterLogin/chatbox.css"
import videoChat from "../../../assets/afterLogin picks/chats/videoChat.png"
import pinChat from "../../../assets/afterLogin picks/chats/pinChat.png"
import imageChat from "../../../assets/afterLogin picks/chats/imageChat.png"
import docIcon from "../../../assets/afterLogin picks/events/doc-icon.svg";
import Modal from 'react-bootstrap/Modal';
import noChats from "../../../assets/afterLogin picks/Practice/practice.svg";
import rain from "../../../assets/afterLogin picks/chats/rain.png"
import arow from "../../../assets/afterLogin picks/chats/arrow.png"
import grupProfile from "../../../assets/afterLogin picks/chats/grupPick.jpg"
import { ThreeDots } from 'react-loader-spinner';
import search from "../../../assets/afterLogin picks/home/Search.png"
// import { useMemo } from 'react';


// import SectionList from "react"

import { useRef } from 'react';
import ChatMap from './ChatMap';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import { BaseUrl } from '../../../reducers/Api/bassUrl';
import { fetchEventsDetails } from '../../../reducers/eventSlice';
import { useDispatch } from 'react-redux';


import Weather01d from '../../../assets/afterLogin picks/chats/01D.svg'
import Weather01n from '../../../assets/afterLogin picks/chats/01N.svg';
import Weather02d from '../../../assets/afterLogin picks/chats/02D.svg';
import Weather02n from '../../../assets/afterLogin picks/chats/02N.svg';
import Weather03d from '../../../assets/afterLogin picks/chats/03D.svg';
import Weather03n from '../../../assets/afterLogin picks/chats/03N.svg';
import Weather04d from '../../../assets/afterLogin picks/chats/04D.svg';
import Weather04n from '../../../assets/afterLogin picks/chats/04N.svg';
import Weather09d from '../../../assets/afterLogin picks/chats/09D.svg';
import Weather09n from '../../../assets/afterLogin picks/chats/09N.svg';
import Weather10d from '../../../assets/afterLogin picks/chats/10D.svg';
import Weather10n from '../../../assets/afterLogin picks/chats/10N.svg';
import Weather11d from '../../../assets/afterLogin picks/chats/11D.svg';
import Weather11n from '../../../assets/afterLogin picks/chats/11N.svg';
import Weather13d from '../../../assets/afterLogin picks/chats/13D.svg';
import Weather13n from '../../../assets/afterLogin picks/chats/13N.svg';
import Weather50d from '../../../assets/afterLogin picks/chats/50D.svg';
import Weather50n from '../../../assets/afterLogin picks/chats/50N.svg';

// import { Navigate } from 'react-router-dom';



const EventChats = ({ chatType, roomId, eventId, info }) => {
    // console.log("room id comming in eventchats component" , roomId, "chat type", chatType);
    // console.log("info in chat events component", info);

    // console.log("event is in chat component", eventId);
    const userData = useSelector((state) => state.auth.user.data.user);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [selectedMessage, setSelectedMessage] = useState("");
    const [memberList, setMemberList] = useState([]);
    const EventDetails = useSelector((state) => state.events.eventDetails);
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.user.data.user.token);
    const [isReply, setIsReply] = useState("");
    // const [replyId, setReplyId] = useState("");

    // console.log("reply message ", isReply);
    // console.log("selected message ", selectedMessage);


    // console.log("new message coming ", messages);

    // console.log("events details in event chats", EventDetails);

    useEffect(() => {
        dispatch(fetchEventsDetails({ eventId: eventId, token }));
    }, [dispatch, eventId, token]);


    // const activeRoomIdRef = useRef(null);

    // useEffect(() => {
    //     console.log("useEffect triigered ");

    //     const activeRoomId = roomId || EventDetails?.eventGroupchat?.roomId;
    //     if (activeRoomId && userData) {
    //         // activeRoomIdRef.current = activeRoomId;
    //         socketService.emit("chatMessage", {
    //             senderId: userData?._id,
    //             roomId: activeRoomId,
    //             page: 1,
    //             // limit: 2000,
    //         });


    //         socketService.on("receiveMessages", (data) => {
    //             console.log("data in receive messages", data);

    //             if (data?.result[0]?.roomId === activeRoomId) {
    //                 // console.log("Received messages:", data);
    //                 setMessages([...data?.result]);
    //                 // setMessages((prevMessages) => [...prevMessages, ...data.result]);

    //                 let data1 = data?.membersList?.map((item) => {
    //                     return {
    //                         id: item._id,
    //                         name: item.fullName,
    //                         userType: item.userType,
    //                         status: item.status,
    //                         joiningDate: item.joiningDate
    //                     };
    //                 });
    //                 setMemberList(data1);

    //             }
    //         });
    //         return () => {
    //             socketService.removeListener("receiveMessages");
    //         };
    //     }
    // }, [roomId, userData, EventDetails?.eventGroupchat?.roomId]);

    // const [forceUpdate, setForceUpdate] = useState(false);
    
    useEffect(() => {
       

        const activeRoomId = roomId || EventDetails?.eventGroupchat?.roomId;
        if (activeRoomId && userData) {
            // activeRoomIdRef.current = activeRoomId;
            socketService.emit("chatMessage", {
                senderId: userData?._id,
                roomId: activeRoomId,
                page: 1,
                // limit: 2000,
            });


            const handleMessage = (data) => {
                // console.log("Data received in receiveMessages:", data);
        
                if (data?.result[0]?.roomId === activeRoomId) {
                  // Update the messages state without triggering a re-render of the effect
                  setMessages([...data?.result]);
                // setMessages((prevMessages) => [...prevMessages, ...data?.result]);
        
                  // Update the member list
                  const updatedMemberList = data?.membersList?.map((item) => ({
                    id: item._id,
                    name: item.fullName,
                    userType: item.userType,
                    status: item.status,
                    joiningDate: item.joiningDate,
                  }));
                  setMemberList(updatedMemberList);
                //   setForceUpdate((prev) => !prev);
                }
              };
        
              // Add the listener for 'receiveMessages' only once
              socketService.on("receiveMessages", handleMessage);


            return () => {
                socketService.removeListener("receiveMessages");
            };
        }
    }, [roomId, userData, EventDetails?.eventGroupchat?.roomId]);
 


    const handleSendMessage = () => {

        if (newMessage.trim()) {
            const encodedMessage = btoa(newMessage);
            const message = {
                roomId: roomId,
                senderId: userData?._id,
                senderType: "user",
                // eventId,
                chatType: chatType,
                message: encodedMessage,
                messageType: 1,
                isReplied: !!isReply && isReply !== "",
                oldMessage: isReply?.message !== "" ? selectedMessage : {},
                createdAt: getCurrentISODateTime(new Date()),
            };

            // console.log("Emitting message:", message);


            socketService.emit('sendMessage', message);

            setIsReply("");
            setSelectedMessage("");
            // Optimistically update the UI
            // setMessages((prevMessages) => [message, ...prevMessages]);
            setNewMessage("");
        }
    };


    // // reply or forward message
    const [hoveredMessageId, setHoveredMessageId] = useState(null);

    // const [openDropDownId, setOpenDropDownId] = useState(null);
    // console.log("openDropDownId", openDropDownId);


    // handle hover events per message
    const handleMouseEnter = (messageId) => {
        setHoveredMessageId(messageId);
    };

    const handleMouseLeave = () => {
        setHoveredMessageId(null);
    };

    // // toggle dropdown for each message
    // const toggleDropDown = (messageId) => {
    //     console.log("toggling dropdown for message id", messageId);
    //     setOpenDropDownId((prevId) => {
    //         console.log('Previous Dropdown ID:', prevId);
    //         if (prevId === messageId) {
    //             return null
    //         } else {
    //             return messageId
    //         }
    //     })
    // };


    //  handle reply 
    const handleReply = (item) => {
        switch (item?.messageType) {
            case 1:
                setIsReply("Text");
                setSelectedMessage(item);
                break;
            case 2:
                setIsReply("Image");
                setSelectedMessage(item);
                break;
            case 3:
                setIsReply("Video");
                setSelectedMessage(item);
                break;
            case 4:
                setIsReply("Documents");
                setSelectedMessage(item);
                break;
            case 5:
                setIsReply("Location");
                setSelectedMessage(item);
                break;
            default:
                break;
        }
    }




    const handleReplyClose = () => {
        setIsReply("");
        setSelectedMessage("");
    }

    const decodedBase64 = (str) => {
        try {
            return atob(str);
        } catch (error) {
            return str
        }
    }

    // Function to render sender-side messages
    const renderSenderSide = (item) => {
        // console.log("Rendering sender side with item:", item);

        switch (item?.messageType) {
            case 1:
                return renderSenderChatMessage(item);
            // case 2:
            //     return item?.media.map((it) => renderSenderChatImage(it, item));
            case 2:
                return item?.media.map((it, index) => (
                    <div key={index}>
                        {renderSenderChatImage(it, item)}
                    </div>
                ));

            // case 3:
            //     return item?.media.map((it) => renderSenderVideo(item, it));
            case 3:
                return item?.media.map((it, index) => (
                    <div key={index}>
                        {renderSenderVideo(item, it)}
                    </div>
                ));
            case 5:
                return renderSenderMapView(item);
            // case 4:
            //     return item?.media.map((it) => renderSenderDocumentFile(item, it));

            case 4:
                return item?.media.map((it, index) => (
                    <div key={index}>
                        {renderSenderDocumentFile(item, it)}
                    </div>
                ));

            case 6:
                return welcomeDesign(item);
            case 7:
                return groupCreateMessage(item);
            case 9:
                return weatherDesign(item);
            default:
                break;
        }
    };

    const renderSenderChatImage = (it, item) => {
        const date = moment(item?.createdAt).format("h:mm A");
        return (
            <div className='d-flex justify-content-end'>

                <div
                    className="receiver-message px-2 py-1 bg-danger dropdown"
                    style={{
                        maxWidth: '70%',
                        borderRadius: ' 10px 10px 0 10px',
                        color: '#000000',
                    }}
                    onMouseEnter={() => handleMouseEnter(item?._id)}
                    onMouseLeave={handleMouseLeave}
                    key={item?._id}
                >

                    <div className='my-1' style={{ height: '200px', width: '200px' }}>
                        <ChatImage image={it} />
                    </div>
                    <p className='p-0 m-0 text-muted' style={{ fontSize: '0.8rem', textAlign: 'right', marginTop: '5px' }}>
                        {date}
                    </p>
                    {/* Dropdown Arrow (visible on hover of this specific message) */}
                    {hoveredMessageId === item?._id && (
                        <button
                            type='button'
                            className=" btn "
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            // onClick={() => toggleDropDown(item?._id)}
                            style={{
                                position: 'absolute',
                                top: '0',
                                right: '5px',
                                // left: '10px',
                                cursor: 'pointer',
                                padding: '0px 7px',
                            }}
                        >

                            <i className="fa-solid fa-chevron-down text-muted" style={{ fontSize: '20px', }}></i>
                        </button>
                    )}

                    {/* Dropdown Menu (visible when clicked on this specific message) */}

                    <div
                        className="dropdown-menu"
                        data-bs-auto-close="outside"
                        style={{
                            position: 'absolute',
                            top: '25px',
                            right: '-15px',
                            backgroundColor: '#fff',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                            borderRadius: '5px',
                            zIndex: 1000,
                            width: '100px',
                            cursor: 'pointer',
                        }}
                    >
                        <p className="dropdown-item mb-0"
                            onClick={() => handleReply(item)}
                            style={{ padding: '5px', cursor: 'pointer' }}>
                            Reply
                        </p>
                        <p className="dropdown-item mb-0"
                            onClick={() => handleShowForwardMessage(item)}

                            style={{ padding: '5px', cursor: 'pointer' }}>
                            Forward
                        </p>
                        <p className="dropdown-item mb-0"
                            onClick={() => handleShowDeleteMessage(item)}

                            style={{ padding: '5px', cursor: 'pointer' }}>
                            Delete
                        </p>
                    </div>

                </div>
            </div>
        )
    };

    const renderSenderVideo = (item, it) => {
        const date = moment(item?.createdAt).format("h:mm A");
        return (
            <div className='d-flex justify-content-end'>

                <div
                    className="receiver-message px-2 py-1 bg-danger dropdown"
                    style={{
                        maxWidth: '70%',
                        borderRadius: '10px 10px 0 10px',
                        color: '#000000',
                    }}

                    onMouseEnter={() => handleMouseEnter(item?._id)}
                    onMouseLeave={handleMouseLeave}
                    key={item?._id}
                >

                    <div className='my-1' style={{ height: '200px', width: '200px' }}>
                        <ChatVideo video={it} />
                    </div>
                    <p className='p-0 m-0 text-muted' style={{ fontSize: '0.8rem', textAlign: 'right', marginTop: '5px' }}>
                        {date}
                    </p>

                    {/* Dropdown Arrow (visible on hover of this specific message) */}
                    {hoveredMessageId === item?._id && (
                        <button
                            type='button'
                            className=" btn "
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            // onClick={() => toggleDropDown(item?._id)}
                            style={{
                                position: 'absolute',
                                top: '0',
                                right: '5px',
                                // left: '10px',
                                cursor: 'pointer',
                                padding: '0px 7px',
                            }}
                        >

                            <i className="fa-solid fa-chevron-down text-muted" style={{ fontSize: '20px', }}></i>
                        </button>
                    )}

                    {/* Dropdown Menu (visible when clicked on this specific message) */}

                    <div
                        className="dropdown-menu"
                        data-bs-auto-close="outside"
                        style={{
                            position: 'absolute',
                            top: '25px',
                            right: '-15px',
                            backgroundColor: '#fff',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                            borderRadius: '5px',
                            zIndex: 1000,
                            width: '100px',
                            cursor: 'pointer',
                        }}
                    >
                        <p className="dropdown-item mb-0"
                            onClick={() => handleReply(item)}
                            style={{ padding: '5px', cursor: 'pointer' }}>
                            Reply
                        </p>
                        <p className="dropdown-item mb-0"
                            onClick={() => handleShowForwardMessage(item)}

                            style={{ padding: '5px', cursor: 'pointer' }}>
                            Forward
                        </p>

                        <p className="dropdown-item mb-0"
                            onClick={() => handleShowDeleteMessage(item)}

                            style={{ padding: '5px', cursor: 'pointer' }}>
                            Delete
                        </p>

                    </div>
                </div>
            </div>
        )
    }

    const renderSenderMapView = (item) => {
        const date = moment(item?.createdAt).format("h:mm A");
        return (
            <div className='d-flex justify-content-end'>

                <div
                    className="receiver-message px-2 py-1 bg-danger dropdown"
                    style={{
                        maxWidth: '70%',
                        borderRadius: '10px 10px 0 10px',
                        color: '#000000',
                    }}

                    onMouseEnter={() => handleMouseEnter(item?._id)}
                    onMouseLeave={handleMouseLeave}
                    key={item?._id}
                >

                    <div className='my-1' style={{ height: '200px', width: '200px' }}>
                        <ChatMap map={item} />
                    </div>
                    <p className='p-0 m-0 text-muted' style={{ fontSize: '0.8rem', textAlign: 'right', marginTop: '5px' }}>
                        {date}
                    </p>

                    {/* Dropdown Arrow (visible on hover of this specific message) */}
                    {hoveredMessageId === item?._id && (
                        <button
                            type='button'
                            className=" btn "
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            // onClick={() => toggleDropDown(item?._id)}
                            style={{
                                position: 'absolute',
                                top: '0',
                                right: '5px',
                                // left: '10px',
                                cursor: 'pointer',
                                padding: '0px 7px',
                            }}
                        >

                            <i className="fa-solid fa-chevron-down text-muted" style={{ fontSize: '20px', }}></i>
                        </button>
                    )}

                    {/* Dropdown Menu (visible when clicked on this specific message) */}

                    <div
                        className="dropdown-menu"
                        data-bs-auto-close="outside"
                        style={{
                            position: 'absolute',
                            top: '25px',
                            right: '-15px',
                            backgroundColor: '#fff',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                            borderRadius: '5px',
                            zIndex: 1000,
                            width: '100px',
                            cursor: 'pointer',
                        }}
                    >
                        <p className="dropdown-item mb-0"
                            onClick={() => handleReply(item)}
                            style={{ padding: '5px', cursor: 'pointer' }}>
                            Reply
                        </p>
                        <p className="dropdown-item mb-0"
                            onClick={() => handleShowForwardMessage(item)}

                            style={{ padding: '5px', cursor: 'pointer' }}>
                            Forward
                        </p>
                        <p className="dropdown-item mb-0"
                            onClick={() => handleShowDeleteMessage(item)}

                            style={{ padding: '5px', cursor: 'pointer' }}>
                            Delete
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    const renderSenderDocumentFile = (item, it) => {
        const date = moment(item?.createdAt).format("h:mm A");
        return (
            <div className='d-flex justify-content-end'>

                <div
                    className="receiver-message px-2 py-1 bg-danger dropdown"
                    style={{
                        maxWidth: '70%',
                        borderRadius: '10px 10px 0 10px',
                        color: '#000000',
                    }}

                    onMouseEnter={() => handleMouseEnter(item?._id)}
                    onMouseLeave={handleMouseLeave}
                    key={item?._id}
                >

                    <div className='mt-1' style={{ height: '30px', width: '200px' }}>
                        <ChatDocs document={it} />
                    </div>
                    <p className='p-0 m-0 text-muted' style={{ fontSize: '0.8rem', textAlign: 'right', marginTop: '5px' }}>
                        {date}
                    </p>
                    {/* Dropdown Arrow (visible on hover of this specific message) */}
                    {hoveredMessageId === item?._id && (
                        <button
                            type='button'
                            className=" btn "
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            // onClick={() => toggleDropDown(item?._id)}
                            style={{
                                position: 'absolute',
                                top: '0',
                                right: '5px',
                                // left: '10px',
                                cursor: 'pointer',
                                padding: '0px 7px',
                            }}
                        >

                            <i className="fa-solid fa-chevron-down text-muted" style={{ fontSize: '20px', }}></i>
                        </button>
                    )}

                    {/* Dropdown Menu (visible when clicked on this specific message) */}

                    <div
                        className="dropdown-menu"
                        data-bs-auto-close="outside"
                        style={{
                            position: 'absolute',
                            top: '25px',
                            right: '-15px',
                            backgroundColor: '#fff',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                            borderRadius: '5px',
                            zIndex: 1000,
                            width: '100px',
                            cursor: 'pointer',
                        }}
                    >
                        <p className="dropdown-item mb-0"
                            onClick={() => handleReply(item)}
                            style={{ padding: '5px', cursor: 'pointer' }}>
                            Reply
                        </p>
                        <p className="dropdown-item mb-0"
                            onClick={() => handleShowForwardMessage(item)}

                            style={{ padding: '5px', cursor: 'pointer' }}>
                            Forward
                        </p>

                        <p className="dropdown-item mb-0"
                            onClick={() => handleShowDeleteMessage(item)}

                            style={{ padding: '5px', cursor: 'pointer' }}>
                            Delete
                        </p>
                    </div>

                </div>
            </div>
        )
    }



    const welcomeDesign = (item) => {
        // console.log("items in welcome design", item);

        return (
            <div className='d-flex justify-content-center'>
                <div
                    className=" px-2 py-2"
                    style={{
                        width: '50%',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        color: '#000000',
                        // border: '1px solid #283593',
                    }}
                >
                    <p className='p-0 m-0 text-center' style={{ fontSize: '14px', fontWeight: '500' }}>Please Welcome</p>
                    <p className='p-0 m-0 text-center' style={{ fontSize: '14px', marginTop: '5px' }}>
                        &#39;{item?.eventMemberDetails?.fullName || item?.teamMemberDetails?.name}&#39; intu  &#39;{
                            chatType === 1 ? info?.chat?.user?.name :               // One-to-one chat
                                chatType === 2 ? info?.chat?.team?.teamName :           // Team group
                                    chatType === 3 ? info?.chat?.adminGroup?.groupName :    // Team admin group
                                        chatType === 4 ? info?.chat?.event?.eventName :    // Event group
                                            chatType === 5 ? info?.chat?.eventAdminGroup?.adminGroupName : // Event admin group
                                                chatType === 6 ? info?.chat?.trainingGroup?.groupName : // Training group
                                                    chatType === 7 ? info?.chat?.trainingFacility?.facilityName :  // Training facility admins and coaches
                                                        'Unknown Chat Type'

                        }&#39;
                    </p>
                </div>
            </div>
        )
    }

    const groupCreateMessage = (item) => {
        const eventData = item?.eventDetails;
        return (
            <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                color: '#000000',
                padding: '10px',
                margin: '10px 0',
            }}>
                <h6>{eventData?.eventName}</h6>
                <hr />
                <div className='d-flex align-items-center'>
                    <img className='me-2' src={pinChat} alt="location" style={{ width: '20px', height: '20px' }} />
                    <p className='pb-0 mb-0' style={{ fontSize: '13px' }}>{eventData?.eventLocation}</p>
                </div>
                <hr />
                <div className='d-flex justify-content-between'>
                    <div className='d-flex align-items-center'>
                        <img src={schedule} alt="schedule" style={{ width: '20px', height: '20px' }} />
                        <p className='mb-0 ms-1' style={{ fontSize: '13px' }}>{eventData?.startDate}</p>
                    </div>
                    <div className='d-flex align-items-center'>
                        <img src={watch} alt="watch" style={{ width: '20px', height: '20px' }} />
                        <p className='mb-0 ms-1' style={{ fontSize: '13px' }}>{eventData?.startTime}</p>
                    </div>
                </div>
            </div>
        )
    }



    const icons = {
        '01d': Weather01d,
        '01n': Weather01n,
        '02d': Weather02d,
        '02n': Weather02n,
        '03d': Weather03d,
        '03n': Weather03n,
        '04d': Weather04d,
        '04n': Weather04n,
        '09d': Weather09d,
        '09n': Weather09n,
        '10d': Weather10d,
        '10n': Weather10n,
        '11d': Weather11d,
        '11n': Weather11n,
        '13d': Weather13d,
        '13n': Weather13n,
        '50d': Weather50d,
        '50n': Weather50n,
    };


    const weatherDesign = (item) => {
        // console.log("weather item", item);

        return (
            <div className='d-flex justify-content-center '>
                <div className='bg-white rounded-3 px-2 py-3'>
                    <p>Here is a weather forecast for your planned event <span className='text-danger'>“{info?.chat?.event?.eventName}”</span>. Plan accordingly ! Enjoy your event !!</p>

                    <div className='rounded-3 p-4' style={{ backgroundColor: "#FDF4F4" }}>
                        <h4 >{item?.weatherData?.dateString}</h4>
                        <p className='mt-0 pt-0'>{EventDetails?.address}</p>

                        {item?.weatherData?.hourly?.filter(hour => hour?.isSummaryRecord).map((hour, index) => {
                            const iconCode = hour?.weather?.[0]?.icon;
                            const weatherIcon = icons[iconCode];
                            return (
                                <div key={index} className='d-flex justify-content-center'>
                                    <div className='rounded-3 d-flex justify-content-center align-items-center' style={{ backgroundColor: "#FFFFFF", width: "200px", height: "60px" }}>
                                        {weatherIcon && (
                                            <img src={weatherIcon} alt=" rain" style={{ width: '40px', height: '40px' }} />
                                        )}
                                        <p className='text-danger ms-3 mb-0'>{hour?.weather?.[0]?.main}</p>
                                    </div>
                                </div>
                            )
                        }


                        )}

                        {item?.weatherData?.hourly?.filter(hour => hour?.isSummaryRecord).map((hour, index) => (
                            <div key={index} className='d-flex justify-content-center '>
                                <div className='container'>
                                    <div className='row wather-report '>
                                        {hour?.wind_speed !== null && (
                                            <div className='col-md-6 d-flex justify-content-center'>
                                                <p>Wind: <span>{hour?.wind_speed}mph</span></p>
                                            </div>
                                        )

                                        }

                                        {hour?.humidity !== null && (
                                            <div className='col-md-6 d-flex justify-content-center'>
                                                <p>Humidity: <span>{hour?.humidity}&#x25; </span></p>
                                            </div>
                                        )}
                                    </div>

                                    <div className='row wather-report'>
                                        {hour?.uvi !== null && (
                                            <div className='col-md-6 d-flex justify-content-center'>
                                                <p>UV index: <span>{hour?.uvi}</span></p>
                                            </div>
                                        )}

                                        {hour?.visibility !== null && (
                                            <div className='col-md-6 d-flex justify-content-center'>
                                                <p>Visibility: <span>{hour?.visibility}mi</span></p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}


                        {item?.weatherData?.hourly.map((item, index) => {
                            const iconCode = item?.weather?.[0]?.icon;
                            const weatherIcon = icons[iconCode];
                            return (
                                <div className=' mt-4'>
                                    <div key={index} className='row '>
                                        <div className='col-md-4 text-center'>
                                            <p>{item?.timeString}</p>
                                        </div>
                                        <div className='col-md-4 d-flex justify-content-center'>
                                            {weatherIcon ? (
                                                <img src={weatherIcon} alt="rain" style={{ width: '35px', height: '35px' }} />
                                            ) : (
                                                <img src={rain} alt="rain" style={{ width: '35px', height: '35px' }} />
                                            )}
                                        </div>

                                        <div className='col-md-4 text-center'>
                                            <p>{item?.temp}&deg;C</p>
                                        </div>
                                    </div>
                                </div>)
                        })}
                    </div>


                </div>


            </div>
        )
    }


    // Function to render sender's chat message
    const renderSenderChatMessage = (item) => {
        // const date = moment(item?.createdAt).format("h:mm A");
        const date = moment(item?.createdAt).format("h:mm A");
        const decryptedMessage = atob(item?.message);
        const checkReply = item?.isReplied;
        const checkForwarded = item?.isForwarded;

        return (
            <div className='d-flex justify-content-end'>
                <div
                    className="sender-message px-2 py-1 bg-danger text-white"
                    style={{
                        maxWidth: '70%',
                        minWidth: "100px",
                        borderRadius: '10px 10px 0 10px',
                        position: 'relative',
                    }}
                    onMouseEnter={() => handleMouseEnter(item?._id)}
                    onMouseLeave={handleMouseLeave}
                    key={item?._id}
                >
                    {checkForwarded && (
                        <div className='mt-0 ms-3 pt-0 d-flex align-items-start justify-content-end'>
                            <img src={arow}
                                alt="forwared"
                                style={{
                                    transition: 'transform 0.3s ease',
                                    transform: hoveredMessageId === item?._id ? 'translateX(-25px)' : 'translateX(0)',
                                }}
                            />
                        </div>
                    )}

                    <div>
                        {checkReply && (
                            <div className='rounded p-2'
                                style={{
                                    backgroundColor: '#f5f5f5',
                                    // minHeight: '100px',
                                    height: 'auto',
                                    maxHeight: '90px',
                                    alignItems: 'center',

                                }}
                            >
                                {item?.oldMessage?.senderDetails?._id !== userData?._id ? (
                                    <p className='p-0 m-0 text-black' style={{ fontWeight: '600' }}>
                                        {item?.oldMessage?.senderDetails?.fullName}
                                    </p>
                                ) : (
                                    <p className='p-0 m-0 text-black' style={{ fontWeight: '600' }}>
                                        You
                                    </p>
                                )}

                                {item?.oldMessage?.messageType === 1 ? (
                                    <p className='p-0 m-0 text-dark' style={{ fontSize: "14px" }}>{decodedBase64(item?.oldMessage?.message)?.slice(0, 150)}</p>
                                ) : item?.oldMessage?.messageType === 2 ? (

                                    <div className='d-flex align-items-center' >

                                        <div className='d-flex flex-row justify-content-center'>
                                            <i className="fa-solid fa-camera-retro pt-1 text-dark" style={{ fontSize: '20px' }}></i>
                                            <p className='mx-2 pt-0 text-dark'>Photo</p>
                                        </div>
                                        <div className='position-relative'>
                                            <img
                                                src={item?.oldMessage?.media?.[0]?.link}
                                                alt='pick'
                                                style={{
                                                    height: '50px',
                                                    width: '50px',
                                                    objectFit: 'cover',
                                                    borderRadius: '5px',
                                                    marginLeft: '10px',
                                                }}
                                            />
                                        </div>
                                    </div>

                                ) : item?.oldMessage?.messageType === 3 ? (
                                    // Video message
                                    <div className='d-flex align-items-center'>
                                        <div className='d-flex flex-row justify-content-center'>
                                            <i className="fa-solid fa-video pt-1 text-dark" style={{ fontSize: '20px' }}></i>
                                            <p className='mx-2 pt-0 text-dark' >Video</p>
                                        </div>
                                        <video
                                            src={item?.oldMessage?.media?.[0]?.link}
                                            controls
                                            style={{
                                                height: '50px',
                                                width: '50px',
                                                marginLeft: '10px',
                                                borderRadius: '5px',
                                            }}
                                        />
                                    </div>
                                ) : item?.oldMessage?.messageType === 4 ? (
                                    <div className='d-flex align-items-center '>
                                        <div className='d-flex flex-row justify-content-center mt-2'>
                                            <i className="fa-solid fa-file text-dark" style={{ fontSize: '20px' }}></i>
                                            <p className='mx-2 pt-0 text-dark'>Document</p>
                                        </div>
                                        {/* <div className='position-relative'>
                                                <p style={{
                                                    height: '50px',
                                                    width: '50px',
                                                    marginLeft: '10px',
                                                    borderRadius: '5px',
                                                }}>
                                                    {item?.oldMessage?.media?.[0]?.name}
                                                </p>
                                            </div> */}
                                    </div>
                                ) : item?.oldMessage?.messageType === 5 ? (
                                    // Location message
                                    <div className='d-flex align-items-center'>
                                        <div className='d-flex flex-row justify-content-center'>
                                            <i className="fa-solid fa-map-marker-alt text-dark" style={{ fontSize: '20px' }}></i>
                                            <p className='mx-2 pt-0 text-dark'>Location</p>
                                        </div>
                                        <div className='position-relative'>
                                            <iframe
                                                style={
                                                    {
                                                        marginLeft: '10px',
                                                        borderRadius: '5px',
                                                        width: '200px',
                                                        height: '50px',
                                                        border: '0.5px solid #ccc'
                                                    }
                                                }
                                                title={`Map showing location at ${item?.oldMessage?.latitude}, ${item?.oldMessage?.longitude}`}
                                                frameborder="0"
                                                src={`https://www.google.com/maps?q=${item?.oldMessage?.latitude},${item?.oldMessage?.longitude}&hl=es;z=14&output=embed`}
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    </div>
                                ) : null

                                }
                            </div>
                        )}
                        <p className='p-0 m-0'>{decryptedMessage}</p>
                    </div>
                    <p className='p-0 m-0 text-gray' style={{ fontSize: '0.6rem', textAlign: 'right', }}>
                        {date}
                    </p>

                    {/* Dropdown Arrow (visible on hover of this specific message) */}
                    {hoveredMessageId === item?._id && (
                        <button
                            type='button'
                            className=" btn "
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            // onClick={() => toggleDropDown(item?._id)}
                            style={{
                                position: 'absolute',
                                top: '0',
                                right: '5px',
                                // left: '10px',
                                cursor: 'pointer',
                                padding: '0px 7px',
                            }}
                        >

                            <i className="fa-solid fa-chevron-down text-muted" style={{ fontSize: '20px', }}></i>
                        </button>
                    )}

                    {/* Dropdown Menu (visible when clicked on this specific message) */}

                    <div
                        className="dropdown-menu"
                        data-bs-auto-close="outside"
                        style={{
                            position: 'absolute',
                            top: '25px',
                            right: '-15px',
                            backgroundColor: '#fff',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                            borderRadius: '5px',
                            zIndex: 1000,
                            width: '100px',
                            cursor: 'pointer',
                        }}
                    >
                        <p className="dropdown-item mb-0"
                            onClick={() => handleReply(item)}
                            style={{ padding: '5px', cursor: 'pointer' }}>
                            Reply
                        </p>
                        <p className="dropdown-item mb-0"
                            onClick={() => handleShowForwardMessage(item)}

                            style={{ padding: '5px', cursor: 'pointer' }}>
                            Forward
                        </p>

                        <p className="dropdown-item mb-0"
                            onClick={() => handleShowDeleteMessage(item)}

                            style={{ padding: '5px', cursor: 'pointer' }}>
                            Delete
                        </p>
                    </div>
                </div>
            </div>
        );
    };


    // Function to render receiver-side messages
    const renderReceiverSide = (item) => {
        // console.log("Rendering receiver side with item:", item);
        switch (item?.messageType) {
            case 1:
                return renderReceiverChatMessage(item);
            // case 2:
            //     return item?.media.map((it) => renderReceiverChatImage(it, item));
            case 2:
                return item?.media.map((it, index) => (
                    <div key={index}>
                        {renderReceiverChatImage(it, item)}
                    </div>
                ));
            // case 3:
            //     return item?.media.map((it) => renderReceiverVideo(item, it));
            case 3:
                return item?.media.map((it, index) => (
                    <div key={index}>
                        {renderReceiverVideo(item, it)}
                    </div>
                ));

            case 5:
                return renderReceiverMapView(item);
            // case 4:
            //     return item?.media.map((it) => renderReceiverDocumentFile(item, it));
            case 4:
                return item?.media.map((it, index) => (
                    <div key={index}>
                        {renderReceiverDocumentFile(item, it)}
                    </div>
                ));

            case 6:
                return welcomeDesign(item);
            case 7:
                return groupCreateMessage(item);
            case 9:
                return weatherDesign(item);

            default:
        }
    };

    const renderReceiverChatImage = (it, item) => {
        // console.log("item in reciver side ", item, it);

        const date = moment(item?.createdAt).format("h:mm A");

        return (
            <div className='d-flex justify-content-start'>
                <div className='me-2'>
                    <img src={item?.senderDetails?.profileImage || profile} alt="profile" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                </div>
                <div
                    className="receiver-message px-2 py-1 dropdown"
                    style={{
                        maxWidth: '70%',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '0 10px 10px 10px',
                        color: '#000000',
                    }}

                    onMouseEnter={() => handleMouseEnter(item?._id)}
                    onMouseLeave={handleMouseLeave}

                    key={item?._id}
                >
                    <div>
                        <p className='p-0 m-0 text-muted' style={{ fontSize: '10px', textAlign: 'left' }}>{item?.senderDetails?.fullName}</p>
                        <div className='my-1' style={{ height: '200px', width: '200px' }}>
                            <ChatImage image={it} />
                        </div>
                        <p className='p-0 m-0 text-muted' style={{ fontSize: '0.8rem', textAlign: 'right', marginTop: '5px' }}>
                            {date}
                        </p>
                    </div>

                    {/* Dropdown Arrow (visible on hover of this specific message) */}
                    {hoveredMessageId === item?._id && (
                        <button
                            type='button'
                            className=" btn "
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            // onClick={() => toggleDropDown(item?._id)}
                            style={{
                                position: 'absolute',
                                top: '0',
                                right: '5px',
                                // left: '10px',
                                cursor: 'pointer',
                                padding: '0px 7px',
                            }}
                        >

                            <i className="fa-solid fa-chevron-down text-muted" style={{ fontSize: '20px', }}></i>
                        </button>
                    )}

                    {/* Dropdown Menu (visible when clicked on this specific message) */}

                    <div
                        className="dropdown-menu"
                        data-bs-auto-close="outside"
                        style={{
                            position: 'absolute',
                            top: '25px',
                            right: '-15px',
                            backgroundColor: '#fff',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                            borderRadius: '5px',
                            zIndex: 1000,
                            width: '100px',
                            cursor: 'pointer',
                        }}
                    >
                        <p className="dropdown-item mb-0"
                            onClick={() => handleReply(item)}
                            style={{ padding: '5px', cursor: 'pointer' }}>
                            Reply
                        </p>
                        <p className="dropdown-item mb-0"
                            onClick={() => handleShowForwardMessage(item)}

                            style={{ padding: '5px', cursor: 'pointer' }}>
                            Forward
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    const renderReceiverVideo = (item, it) => {
        // console.log("item in reciver side invdeio ",  it);
        const date = moment(item?.createdAt).format("h:mm A");
        return (
            <div className='d-flex justify-content-start'>
                <div className='me-2'>
                    <img src={item?.senderDetails?.profileImage || profile} alt="profile" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                </div>
                <div
                    className="receiver-message px-2 py-1 dropdown"
                    style={{
                        maxWidth: '70%',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '0 10px 10px 10px',
                        color: '#000000',
                    }}

                    onMouseEnter={() => handleMouseEnter(item?._id)}
                    onMouseLeave={handleMouseLeave}
                    key={item?._id}
                >
                    <p className='p-0 m-0 text-muted' style={{ fontSize: '10px', textAlign: 'left' }}>{item?.senderDetails?.fullName}</p>
                    <div className='my-1' style={{ height: '200px', width: '200px' }}>
                        <ChatVideo video={it} />
                    </div>
                    <p className='p-0 m-0 text-muted' style={{ fontSize: '0.8rem', textAlign: 'right', marginTop: '5px' }}>
                        {date}
                    </p>

                    {/* Dropdown Arrow (visible on hover of this specific message) */}
                    {hoveredMessageId === item?._id && (
                        <button
                            type='button'
                            className=" btn "
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            // onClick={() => toggleDropDown(item?._id)}
                            style={{
                                position: 'absolute',
                                top: '0',
                                right: '5px',
                                // left: '10px',
                                cursor: 'pointer',
                                padding: '0px 7px',
                            }}
                        >

                            <i className="fa-solid fa-chevron-down text-muted" style={{ fontSize: '20px', }}></i>
                        </button>
                    )}

                    {/* Dropdown Menu (visible when clicked on this specific message) */}

                    <div
                        className="dropdown-menu"
                        data-bs-auto-close="outside"
                        style={{
                            position: 'absolute',
                            top: '25px',
                            right: '-15px',
                            backgroundColor: '#fff',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                            borderRadius: '5px',
                            zIndex: 1000,
                            width: '100px',
                            cursor: 'pointer',
                        }}
                    >
                        <p className="dropdown-item mb-0"
                            onClick={() => handleReply(item)}
                            style={{ padding: '5px', cursor: 'pointer' }}>
                            Reply
                        </p>
                        <p className="dropdown-item mb-0"
                            onClick={() => handleShowForwardMessage(item)}

                            style={{ padding: '5px', cursor: 'pointer' }}>
                            Forward
                        </p>
                    </div>
                </div>
            </div>
        )
    }
    // Function to render receiver's chat message



    const renderReceiverChatMessage = (item) => {
        // console.log("item in reciver side ", item);

        const decryptedMessage = atob(item?.message);
        // const date = moment(item?.createdAt).format("h:mm A");
        const date = moment(item?.createdAt).format("h:mm A");
        const checkReply = item?.isReplied;
        const checkForwarded = item?.isForwarded;

        return (
            <div className='d-flex justify-content-start'
                style={{ position: 'relative' }}
            >
                <div className='me-2'>
                    <img src={item?.senderDetails?.profileImage || profile} alt="profile" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                </div>
                <div
                    className="receiver-message px-2 py-1 dropdown"
                    // style={{
                    //     maxWidth: '70%',
                    //     minWidth: '100px',
                    //     backgroundColor: '#FFFFFF',
                    //     borderRadius: '0 10px 10px 10px',
                    //     color: '#000000',
                    // }}
                    style={checkForwarded ? {
                        maxWidth: '70%',
                        minWidth: '115px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '0 10px 10px 10px',
                        color: '#000000',
                    } : {
                        maxWidth: '70%',
                        minWidth: '100px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '0 10px 10px 10px',
                        color: '#000000',
                    }}
                    onMouseEnter={() => handleMouseEnter(item?._id)}
                    onMouseLeave={handleMouseLeave}
                    key={item?._id}
                >
                    <div>

                        <div className='d-flex'>
                            <p className='p-0 m-0 text-muted' style={{ fontSize: '10px', textAlign: 'left' }}>{item?.senderDetails?.fullName}</p>

                            {checkForwarded && (
                                <div className='mt-0 ms-2 pt-0  d-flex align-items-start '>
                                    <img src={arow} alt="forwared" />
                                </div>
                            )}
                        </div>


                        <div>
                            {checkReply && (
                                <div className='rounded p-2'
                                    style={{
                                        backgroundColor: '#f5f5f5',
                                        // minHeight: '100px',
                                        height: 'auto',
                                        maxHeight: '90px',
                                        alignItems: 'center',

                                    }}
                                >
                                    {item?.oldMessage?.senderDetails?._id !== userData?._id ? (
                                        <p className='p-0 m-0 text-black' style={{ fontWeight: '600' }}>
                                            {item?.oldMessage?.senderDetails?.fullName}
                                        </p>
                                    ) : (
                                        <p className='p-0 m-0 text-black' style={{ fontWeight: '600' }}>
                                            You
                                        </p>
                                    )}

                                    {item?.oldMessage?.messageType === 1 ? (
                                        <p className='p-0 m-0' style={{ fontSize: "14px" }}>{decodedBase64(item?.oldMessage?.message)?.slice(0, 150)}</p>
                                    ) : item?.oldMessage?.messageType === 2 ? (

                                        <div className='d-flex align-items-center' >

                                            <div className='d-flex flex-row justify-content-center'>
                                                <i className="fa-solid fa-camera-retro pt-1" style={{ fontSize: '20px' }}></i>
                                                <p className='mx-2 pt-0'>Photo</p>
                                            </div>
                                            <div className='position-relative'>
                                                <img
                                                    src={item?.oldMessage?.media?.[0]?.link}
                                                    alt='pick'
                                                    style={{
                                                        height: '50px',
                                                        width: '50px',
                                                        objectFit: 'cover',
                                                        borderRadius: '5px',
                                                        marginLeft: '10px',
                                                    }}
                                                />
                                            </div>
                                        </div>

                                    ) : item?.oldMessage?.messageType === 3 ? (
                                        // Video message
                                        <div className='d-flex align-items-center'>
                                            <div className='d-flex flex-row justify-content-center'>
                                                <i className="fa-solid fa-video pt-1" style={{ fontSize: '20px' }}></i>
                                                <p className='mx-2 pt-0'>Video</p>
                                            </div>
                                            <video
                                                src={item?.oldMessage?.media?.[0]?.link}
                                                controls
                                                style={{
                                                    height: '50px',
                                                    width: '50px',
                                                    marginLeft: '10px',
                                                    borderRadius: '5px',
                                                }}
                                            />
                                        </div>
                                    ) : item?.oldMessage?.messageType === 4 ? (
                                        <div className='d-flex align-items-center '>
                                            <div className='d-flex flex-row justify-content-center mt-2'>
                                                <i className="fa-solid fa-file" style={{ fontSize: '20px' }}></i>
                                                <p className='mx-2 pt-0'>Document</p>
                                            </div>
                                            {/* <div className='position-relative'>
                                                <p style={{
                                                    height: '50px',
                                                    width: '50px',
                                                    marginLeft: '10px',
                                                    borderRadius: '5px',
                                                }}>
                                                    {item?.oldMessage?.media?.[0]?.name}
                                                </p>
                                            </div> */}
                                        </div>
                                    ) : item?.oldMessage?.messageType === 5 ? (
                                        // Location message
                                        <div className='d-flex align-items-center'>
                                            <div className='d-flex flex-row justify-content-center'>
                                                <i className="fa-solid fa-map-marker-alt" style={{ fontSize: '20px' }}></i>
                                                <p className='mx-2 pt-0'>Location</p>
                                            </div>
                                            <div className='position-relative'>
                                                <iframe
                                                    style={
                                                        {
                                                            marginLeft: '10px',
                                                            borderRadius: '5px',
                                                            width: '200px',
                                                            height: '50px',
                                                            border: '0.5px solid #ccc',
                                                        }
                                                    }
                                                    title={`Map showing location at ${item?.oldMessage?.latitude}, ${item?.oldMessage?.longitude}`}
                                                    frameborder="0"
                                                    src={`https://www.google.com/maps?q=${item?.oldMessage?.latitude},${item?.oldMessage?.longitude}&hl=es;z=14&output=embed`}
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                        </div>
                                    ) : null

                                    }
                                </div>
                            )}


                            <p className='p-0 m-0'>{decryptedMessage}</p>
                        </div>
                        <p className='p-0 m-0 text-muted' style={{ fontSize: '0.6rem', textAlign: 'left', marginTop: '5px' }}>
                            {date}
                        </p>
                    </div>

                    {/* Dropdown Arrow (visible on hover of this specific message) */}
                    {hoveredMessageId === item?._id && (
                        <button
                            type='button'
                            className=" btn "
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            // onClick={() => toggleDropDown(item?._id)}
                            style={{
                                position: 'absolute',
                                top: '0',
                                right: '0',
                                // left: '10px',
                                cursor: 'pointer',
                                padding: '0px 7px',
                            }}
                        >

                            <i className="fa-solid fa-chevron-down text-muted"
                                style={{ fontSize: '20px' }}
                            // style={checkForwarded ? { fontSize: '20px', marginLeft: '5rem' } : { fontSize: '20px' }}

                            ></i>
                        </button>
                    )}

                    {/* Dropdown Menu (visible when clicked on this specific message) */}

                    <div
                        className="dropdown-menu"
                        data-bs-auto-close="outside"
                        style={{
                            position: 'absolute',
                            top: '25px',
                            right: '-15px',
                            backgroundColor: '#fff',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                            borderRadius: '5px',
                            zIndex: 1000,
                            width: '100px',
                            cursor: 'pointer',
                        }}
                    >
                        <p className="dropdown-item mb-0"
                            onClick={() => handleReply(item)}
                            style={{ padding: '5px', cursor: 'pointer' }}>
                            Reply
                        </p>
                        <p className="dropdown-item mb-0"
                            onClick={() => handleShowForwardMessage(item)}
                            style={{ padding: '5px', cursor: 'pointer' }}>
                            Forward
                        </p>
                    </div>

                </div>




            </div>
        );
    };

    const renderReceiverMapView = (item) => {
        // console.log("item in reciver side in map ", item,);
        const date = moment(item?.createdAt).format("h:mm A");
        return (
            <div className='d-flex justify-content-start'>
                <div className='me-2'>
                    <img src={item?.senderDetails?.profileImage || profile} alt="profile" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                </div>
                <div
                    className="receiver-message px-2 py-1 dropdown"
                    style={{
                        maxWidth: '70%',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '0 10px 10px 10px',
                        color: '#000000',
                    }}
                    onMouseEnter={() => handleMouseEnter(item?._id)}
                    onMouseLeave={handleMouseLeave}
                    key={item?._id}
                >
                    <p className='p-0 m-0 text-muted' style={{ fontSize: '10px', textAlign: 'left' }}>{item?.senderDetails?.fullName}</p>
                    <div className='my-1' style={{ height: '200px', width: '200px' }}>
                        <ChatMap map={item} />
                    </div>
                    <p className='p-0 m-0 text-muted' style={{ fontSize: '0.8rem', textAlign: 'right', marginTop: '5px' }}>
                        {date}
                    </p>


                    {/* Dropdown Arrow (visible on hover of this specific message) */}
                    {hoveredMessageId === item?._id && (
                        <button
                            type='button'
                            className=" btn "
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            // onClick={() => toggleDropDown(item?._id)}
                            style={{
                                position: 'absolute',
                                top: '0',
                                right: '5px',
                                // left: '10px',
                                cursor: 'pointer',
                                padding: '0px 7px',
                            }}
                        >

                            <i className="fa-solid fa-chevron-down text-muted" style={{ fontSize: '20px', }}></i>
                        </button>
                    )}

                    {/* Dropdown Menu (visible when clicked on this specific message) */}

                    <div
                        className="dropdown-menu"
                        data-bs-auto-close="outside"
                        style={{
                            position: 'absolute',
                            top: '25px',
                            right: '-15px',
                            backgroundColor: '#fff',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                            borderRadius: '5px',
                            zIndex: 1000,
                            width: '100px',
                            cursor: 'pointer',
                        }}
                    >
                        <p className="dropdown-item mb-0"
                            onClick={() => handleReply(item)}
                            style={{ padding: '5px', cursor: 'pointer' }}>
                            Reply
                        </p>
                        <p className="dropdown-item mb-0" style={{ padding: '5px', cursor: 'pointer' }}>
                            Forward
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    const renderReceiverDocumentFile = (item, it) => {
        // console.log("item in reciver side in doc ", it);

        const date = moment(item?.createdAt).format("h:mm A");

        return (
            <div className='d-flex justify-content-start'>
                <div className='me-2'>
                    <img src={item?.senderDetails?.profileImage || profile} alt="profile" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                </div>
                <div
                    className="receiver-message px-2 py-1 dropdown"
                    style={{
                        maxWidth: '70%',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '0 10px 10px 10px',
                        color: '#000000',
                    }}
                    onMouseEnter={() => handleMouseEnter(item?._id)}
                    onMouseLeave={handleMouseLeave}
                    key={item?._id}
                >
                    <p className='p-0 m-0 text-muted' style={{ fontSize: '10px', textAlign: 'left' }}>{item?.senderDetails?.fullName}</p>
                    <div className='mt-1' style={{ height: '30px', width: '200px' }}>
                        <ChatDocs document={it} />
                    </div>
                    <p className='p-0 m-0 text-muted' style={{ fontSize: '0.8rem', textAlign: 'right', marginTop: '5px' }}>
                        {date}
                    </p>

                    {/* Dropdown Arrow (visible on hover of this specific message) */}
                    {hoveredMessageId === item?._id && (
                        <button
                            type='button'
                            className=" btn "
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            // onClick={() => toggleDropDown(item?._id)}
                            style={{
                                position: 'absolute',
                                top: '0',
                                right: '5px',
                                // left: '10px',
                                cursor: 'pointer',
                                padding: '0px 7px',
                            }}
                        >

                            <i className="fa-solid fa-chevron-down text-muted" style={{ fontSize: '20px', }}></i>
                        </button>
                    )}

                    {/* Dropdown Menu (visible when clicked on this specific message) */}

                    <div
                        className="dropdown-menu"
                        data-bs-auto-close="outside"
                        style={{
                            position: 'absolute',
                            top: '25px',
                            right: '-15px',
                            backgroundColor: '#fff',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                            borderRadius: '5px',
                            zIndex: 1000,
                            width: '100px',
                            cursor: 'pointer',
                        }}
                    >
                        <p className="dropdown-item mb-0"
                            onClick={() => handleReply(item)}
                            style={{ padding: '5px', cursor: 'pointer' }}>
                            Reply
                        </p>
                        <p className="dropdown-item mb-0"
                            onClick={() => handleShowForwardMessage(item)}

                            style={{ padding: '5px', cursor: 'pointer' }}>
                            Forward
                        </p>
                    </div>

                </div>
            </div>
        )
    }



    // get section list
    const [sectionList, setSectionList] = useState([]);
    // const scrollViewRef = useRef(null);
    console.log("sectionList", sectionList);

    useEffect(() => {
        const getSectionData = () => {
            const joiningDate = memberList.find(user => user.id === userData._id)?.joiningDate || null;
            // console.log("jncbdjcbjdcdcdhjc1234565434567",joiningDate);
            const referenceDate = joiningDate || new Date();

            let groupedByDate = messages?.reduce((acc, obj) => {
                let date = obj.createdAt.split("T")[0]; // Extract the date part

                if ((moment(obj.createdAt) >= moment(referenceDate)) || chatType === 1) {
                    if (!acc[date]) {
                        acc[date] = []; // Initialize if not already done
                    }
                    acc[date].push(obj); // Push the object
                }
                return acc;
            }, {});

            let newArray = Object.entries(groupedByDate).map(([date, data]) => ({
                date,
                data,
            }));
            setSectionList(newArray);
            return newArray;
        };

        getSectionData();
    }, [messages, memberList, userData, chatType]); // Add all necessary dependencies


    // scroll to bottom
    const messageContainerRef = useRef(null);
    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [sectionList]);



    // send image model
    const [showSendImage, setShowSendImage] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    // console.log("prosess check ", progress);

    const imageInputRef = useRef(null);
    const handleShowSendImage = () => {
        setShowSendImage(true);
    }

    const handleCloseSendImage = () => {
        setShowSendImage(false);
        setSelectedImage(null);

        if (imageInputRef.current) {
            imageInputRef.current.value = ''
        }
    }

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // const imageUrl = URL.createObjectURL(file)
            setSelectedImage(file);
            handleShowSendImage()
        }
    }
    const handleImageButtonClick = () => {
        if (imageInputRef.current) {
            imageInputRef.current.click();
        }
    }

    const handleSendImage = async () => {
        setIsLoading(true);
        handleCloseSendImage();
        const data = new FormData();
        data.append("media", selectedImage);

        try {
            const onUploadProgress = (progressEvent) => {
                const { loaded, total } = progressEvent;
                const percent = Math.floor((loaded * 100) / total);
                setProgress(percent / 100); // Update progress
            }

            // console.log("check what image send ", ...data);


            const Url = BaseUrl()
            const response = await axios.post(`${Url}/user/upload/media`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress,
            })

            if (response.data.status === 200) {
                const documentFile = response?.data?.data?.media

                // console.log("Image uploaded successfully:", documentFile);
                //   return;
                // Emit the uploaded media via WebSocket (replace socket.emit logic with your own)
                socketService.emit("sendMessage", {
                    roomId: roomId,
                    senderId: userData._id,
                    messageType: 2,
                    media: documentFile,
                    chatType: chatType,
                    senderType: "user",
                });

                setIsLoading(false);
                handleCloseSendImage();
            } else {
                console.error("Failed to upload image:", response);
                setIsLoading(false);
                toast.error("Failed to upload image");
            }
        } catch (error) {
            setIsLoading(false);
            console.error("Error uploading the image:", error);
            toast.error("Error uploading the image");
        }
    }


    // send video model
    const [showSendVideo, setShowSendVideo] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const videoInputRef = useRef(null);

    const handleShowSendVideo = () => {
        setShowSendVideo(true);
    }
    const handleCloseSendVideo = () => {
        setShowSendVideo(false);
        if (videoInputRef.current) {
            videoInputRef.current.value = ''
        }
    }
    const handleVideoSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // const videoUrl = URL.createObjectURL(file)
            setSelectedVideo(file);
            handleShowSendVideo()
        }
    }
    const handleVideoButtonClick = () => {
        if (videoInputRef.current) {
            videoInputRef.current.click();
        }
    }

    const handleSendVideo = async () => {
        setIsLoading(true);
        handleCloseSendVideo();
        const data = new FormData();
        data.append("media", selectedVideo);

        try {
            const onUploadProgress = (progressEvent) => {
                // console.log("upload start");

                const { loaded, total } = progressEvent;
                const percent = Math.floor((loaded * 100) / total);
                setProgress(percent / 100); // Update progress
            }

            console.log("check what video send ", ...data);


            const Url = BaseUrl()
            const response = await axios.post(`${Url}/user/upload/media`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress,
            })

            if (response.data.status === 200) {
                const documentFile = response?.data?.data
                console.log("video uploaded successfully:", documentFile);
                // return;
                // Emit the uploaded media via WebSocket (replace socket.emit logic with your own)
                socketService.emit("sendMessage", {
                    roomId: roomId,
                    senderId: userData._id,
                    messageType: 3,
                    media: documentFile,
                    chatType: chatType,
                    senderType: "user",
                });
                setProgress(0)

            } else {
                console.error("Failed to upload video:", response);
                toast.error(response.data.errors.msg);
                setProgress(0)
            }
        } catch (error) {

            console.error("Error uploading the video:", error);
            toast.error("Error uploading the video");
        } finally {
            setIsLoading(false);
            setSelectedVideo(null);
        }
    }


    // send location 
    const [showSendLocation, setShowSendLocation] = useState(false);
    const [location, setLocation] = useState({ lat: null, lng: null });
    const [locationError, setLocationError] = useState(null);

    const handleShowSendLocation = () => {
        setShowSendLocation(true);
    }
    const handleCloseSendLocation = () => {
        setShowSendLocation(false);
        setLocation({ lat: null, lng: null });
        setLocationError(null);
    }

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    handleShowSendLocation();
                },
                (error) => {
                    if (error.code === error.PERMISSION_DENIED) {
                        toast.error('Location access denied. Please allow location services in your device settings.');
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                        toast.error('Location information is unavailable. Please try again later.');
                    } else if (error.code === error.TIMEOUT) {
                        toast.error('The request to get your location timed out. Please try again.');
                    } else {
                        toast.error('Unable to retrieve location. Please try again.');
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000, // Timeout after 10 seconds
                    maximumAge: 0,  // Don't use a cached position
                }
            );
        } else {
            setLocationError('Geolocation is not supported by this browser.');
        }
    }

    const sendLocation = () => {
        socketService.emit("sendMessage", {
            roomId: roomId,
            senderId: userData?._id,
            // receiverId: "65858a93beaf9454888ec1d6",
            senderType: "user",
            ...(chatType === 1 && { receiverType: "user" }),
            // receiverType: "user",
            chatType: chatType,
            messageType: 5,
            latitude: location?.lat,
            longitude: location?.lng,
        });
        handleCloseSendLocation();
    }


    // send document
    const [showSendDocument, setShowSendDocument] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const docInputRef = useRef(null);
    const handleShowSendDocument = () => {
        setShowSendDocument(true);
    }

    const handleCloseSendDocument = () => {
        setShowSendDocument(false);
        setSelectedDocument(null);

        if (docInputRef.current) {
            docInputRef.current.value = ''
        }
    }

    const handleDocumentSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            // const documentUrl = URL.createObjectURL(file)
            setSelectedDocument(file);
            handleShowSendDocument()
        } else {
            toast.error("Please select a valid pdf file");
        }
    }

    const handleDocumentButtonClick = () => {
        document.getElementById("documentInput").click();
    }

    const handleSendDocument = async () => {
        setIsLoading(true);
        const data = new FormData();
        data.append("media", selectedDocument);

        try {
            const onUploadProgress = (progressEvent) => {
                const { loaded, total } = progressEvent;
                const percent = Math.floor((loaded * 100) / total);
                setProgress(percent / 100); // Update progress
            }

            // console.log("check what image send ", ...data);


            const Url = BaseUrl()
            const response = await axios.post(`${Url}/user/upload/media`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress,
            })

            if (response.status === 200) {
                const documentFile = response?.data?.data?.media

                // console.log("Image uploaded successfully:", documentFile);
                //   return;
                // Emit the uploaded media via WebSocket (replace socket.emit logic with your own)
                socketService.emit("sendMessage", {
                    roomId: roomId,
                    senderId: userData._id,
                    messageType: 4,
                    media: documentFile,
                    chatType: chatType,
                    senderType: "user",
                });

                setIsLoading(false);
                handleCloseSendDocument();
            } else {
                console.error("Failed to upload image:", response);
                setIsLoading(false);
                toast.error("Failed to upload image");
            }
        } catch (error) {
            setIsLoading(false);
            console.error("Error uploading the image:", error);
            toast.error("Error uploading the image");
        }
    }


    //   show forward message
    const [showForwardMessage, setShowForwardMessage] = useState(false);
    const [forwardedMessage, setForwardedMessage] = useState(null);

    const handleShowForwardMessage = (item) => {
        console.log("item in show forward message", item);
        setShowForwardMessage(true, item);
        setForwardedMessage(item);
    }

    const handleCloseForwardMessage = () => {
        setShowForwardMessage(false);
    }

    const [searchTerm, setSearchTerm] = useState('');
    const [chatList, setChatList] = useState([]);
    const [archive, setArchive] = useState(false);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        setArchive(false);
    }, [])


    useEffect(() => {
        socketService.initializeSocket();
        return () => {
            socketService.disconnectSocket();
        };
    }, []);


    useEffect(() => {
        setLoading(true);
        socketService.emit('chatList', {
            senderId: userData?._id,
            isArchived: archive
        });


        socketService.on('chatUserList', (data) => {
            // console.log("Received chatUserList event:", data);
            setChatList(data?.result);
            setLoading(false);
        })

        return () => {
            socketService.removeListener('chatList');
        }
    }, [userData?._id, archive]);



    const truncateMessage = (message, maxLength) => {
        if (message.length > maxLength) {
            return message.slice(0, maxLength) + '...';
        }
        return message;
    };

    const handleForwardMessage = (chat) => {
        console.log("Original item to forward:", forwardedMessage);
        console.log("Selected chat to forward to:", chat);

        if (forwardedMessage && userData) {
            // const encodedMessage = btoa(forwardedMessage?.message);
            const message = {
                roomId: chat?.roomId,
                senderId: userData?._id,
                senderType: "user",
                // eventId,
                chatType: chat?.chatType,
                message: forwardedMessage?.message,
                messageType: forwardedMessage?.messageType,
                isReplied: !!isReply && isReply !== "",
                oldMessage: isReply?.message !== "" ? selectedMessage : {},
                createdAt: getCurrentISODateTime(new Date()),
                isForwarded: true,
            };

            socketService.emit('sendMessage', message);
            setIsReply("");
            setSelectedMessage("");
            // Optimistically update the UI
            setMessages((prevMessages) => [message, ...prevMessages]);
            setNewMessage("");
            setShowForwardMessage(false);
            // Navigate() 
        }
    }


    // handle delete 
    const [showDelete, setShowDelete] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState(null);
    // console.log("selected message for delete", deleteMessage);

    const handleShowDeleteMessage = (item) => {
        setShowDelete(true)
        setDeleteMessage(item)
    }
    const handleCloseDeleteMessage = () => {
        setShowDelete(false)
        setDeleteMessage(null)
    }

    const handleDeleteMessage = () => {
        socketService.emit("deleteMessage", {
            senderId: userData?._id,
            id: deleteMessage?._id,
            roomId: roomId,
            deletedMedia: selectedImage ? [selectedImage?._id] : null,
        });

        setShowDelete(false)
    }


    return (
        <div className=" position-relative">
            <div className='itemsColor rounded-4'>
                <div className="row align-items-center">
                    <div className="col my-3" style={{ height: "15px" }}>
                        {
                            chatType === 1 ? (
                                <h6 className="mb-0 ms-2">{info?.chat?.user?.name} </h6>
                            ) : chatType === 2 ? (
                                <h6 className='mb-0 ms-2'>{info?.chat?.team?.teamName}</h6>
                            ) : chatType === 3 ? (
                                <h6 className='mb-0 ms-2'>{info?.chat?.event?.eventName}</h6>
                            ) : chatType === 4 ? (
                                <h6 className='mb-0 ms-2'>{info?.chat?.event?.eventName}</h6>
                            ) : chatType === 5 ? (
                                <h6 className='mb-0 ms-2'>{info?.chat?.event?.eventName}</h6>
                            ) : chatType === 6 ? (
                                <h6 className='mb-0 ms-2'>{info?.chat?.event?.eventName}</h6>
                            ) : chatType === 7 ? (
                                <h6 className='mb-0 ms-2'>{info?.chat?.event?.eventName}</h6>
                            ) : (
                                null
                            ) || <h6 className='mb-0 ms-2'>{EventDetails?.eventName}</h6>

                        }
                    </div>
                </div>

                {/* Chat messages container */}

                <ToastContainer />


                <div className='rounded-bottom-3'
                    style={{
                        height: '31rem',
                        backgroundColor: "#A9AED4"
                    }}
                >

                    <div
                        ref={messageContainerRef}
                        style={{ height: '29.7rem', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: '60px', }}>


                        {/* Check if sectionList has data */}
                        {sectionList && sectionList.length > 0 ? (
                            [...sectionList].reverse().map((section, sectionIndex) => (
                                <div key={sectionIndex}>
                                    {/* Render the section header (date) */}
                                    <div className='d-flex justify-content-center'>
                                        <div className='rounded-3 px-2 py-1'
                                            style={{
                                                textAlign: 'center',
                                                margin: '10px 0',
                                                backgroundColor: "#ffffff",
                                            }}>
                                            <p className='p-0 m-0 text-muted' style={{ fontSize: '13px', fontWeight: "600" }}>
                                                {moment(section.date).format("DD MMMM YYYY")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Render the messages in this section */}
                                    {[...section.data].reverse().map((message, messageIndex) => (
                                        <div key={messageIndex} className={`p-2`}>
                                            {message.senderId === userData?._id
                                                ? renderSenderSide(message)
                                                : renderReceiverSide(message)}
                                        </div>
                                    ))}
                                </div>
                            ))
                        ) : (
                            // Render Default UI if there are no sections or chats
                            <div className='d-flex flex-column align-items-center justify-content-center' style={{ height: '100%' }}>
                                <img src={noChats} alt="no chats" style={{ width: '200px', height: '200px' }} />
                                <p className='text-muted pb-0 mb-0' style={{ fontSize: '16px', fontWeight: '600' }}>
                                    No chats available
                                </p>
                                <p className='text-muted mt-0 pt-0' style={{ fontSize: '14px' }}>
                                    Start a conversation to see messages here.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {progress > 0 && progress < 1 && (
                    <div className='d-flex justify-content-center position-absolute'
                        style={{
                            bottom: '50%',
                            left: '45%',
                        }}>
                        <p>Uploading Video: {Math.floor(progress * 100)}%</p>
                    </div>
                )}


                {/* Input and send button container */}
                <div className='d-flex justify-content-center'>


                    {isReply && (
                        <div
                            style={{
                                position: 'absolute',
                                bottom: '1rem',
                                width: '100%',

                            }}
                        >
                            <div className='rounded-3 mx-2 pt-2 px-2'
                                style={{
                                    backgroundColor: "#ffffff",
                                    maxHeight: '120px',
                                    minHeight: '120px',
                                }}
                            >
                                <div className='row mx-2'

                                >
                                    <div className='col-md-11 rounded-3'
                                        style={{
                                            maxHeight: '100px',
                                            backgroundColor: '#f1f1f1',
                                        }}
                                    >

                                        {selectedMessage?.senderDetails?._id === userData?._id ? (
                                            <p className='pt-1 pb-0 px-0 m-0' style={{ fontWeight: '600' }}>
                                                You
                                            </p>
                                        ) : (
                                            <p className='pt-1 pb-0 px-0 m-0' style={{ fontWeight: '600' }}>{selectedMessage?.senderDetails?.fullName}</p>
                                        )}

                                        {isReply === "Text" ? (

                                            <p style={{ fontSize: '14px' }}>{atob(selectedMessage?.message).slice(0, 70)}</p>
                                        ) :
                                            isReply === "Image" ? (
                                                <div className=' d-flex justify-content-between '>
                                                    <div className='d-flex justify-content-start pt-2' style={{ height: "80px" }}>
                                                        <i className="fa-solid fa-camera-retro pt-1" style={{ fontSize: '20px' }}></i>
                                                        <p className='mx-2 pt-0'>Photo</p>
                                                    </div>

                                                    <div className='position-relative'>
                                                        <img src={selectedMessage?.media?.[0]?.link} alt="selected pick"
                                                            style={{
                                                                width: "70px",
                                                                height: "70px",
                                                                borderRadius: "10px",
                                                                position: "absolute",
                                                                top: "15%",
                                                                bottom: "0",
                                                                // left: "50%",
                                                                right: "-5px",
                                                                transform: "translate(0, -50%)",
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : isReply === "Video" ? (
                                                <div className=' d-flex justify-content-between '>
                                                    <div className='d-flex justify-content-start pt-2' style={{ height: "80px" }}>
                                                        <i className="fa-solid fa-video pt-1" style={{ fontSize: '20px' }}></i>

                                                        <p className='mx-2 pt-0'>Video</p>
                                                    </div>

                                                    <div className='position-relative'>
                                                        <video src={selectedMessage?.media?.[0]?.link} alt="selected pick"
                                                            style={{
                                                                width: "70px",
                                                                height: "70px",
                                                                borderRadius: "10px",
                                                                position: "absolute",
                                                                top: "15%",
                                                                bottom: "0",
                                                                // left: "50%",
                                                                right: "-5px",
                                                                transform: "translate(0, -50%)",
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : isReply === "Documents" ? (
                                                <div className=' d-flex justify-content-between '>
                                                    <div className='d-flex justify-content-start pt-2' style={{ height: "80px" }}>
                                                        <i className="fa-solid fa-file" style={{ fontSize: '20px' }}></i>
                                                        <p className='mx-2 pt-0'>Document</p>
                                                    </div>

                                                    {/* <div className='position-relative'>
                                                        <iframe 
                                                        src={`https://docs.google.com/gview?url=${selectedMessage?.media?.[0]?.link}&embedded=true`}
                                                            style={{
                                                                width: "70px",
                                                                height: "70px",
                                                                borderRadius: "10px",
                                                                position: "absolute",
                                                                top: "15%",
                                                                bottom: "0",
                                                                // left: "50%",
                                                                right: "-5px",
                                                                transform: "translate(0, -50%)",
                                                            }}
                                                            title="Document Preview"
                                                        />

                                                        
                                                    </div> */}
                                                </div>
                                            ) : isReply === "Location" ? (
                                                <div className=' d-flex justify-content-between '>
                                                    <div className='d-flex justify-content-start pt-2' style={{ height: "80px" }}>
                                                        <i className="fa-solid fa-map-marker-alt" style={{ fontSize: '20px' }}></i>
                                                        <p className='mx-2 pt-0'>Location</p>
                                                    </div>

                                                    <div className='position-relative'>
                                                        <iframe
                                                            style={
                                                                {
                                                                    width: "150px",
                                                                    height: "70px",
                                                                    border: '0.5px solid #ccc',
                                                                    borderRadius: "10px",
                                                                    position: "absolute",
                                                                    top: "15%",
                                                                    bottom: "0",
                                                                    // left: "50%",
                                                                    right: "-5px",
                                                                    transform: "translate(0, -50%)",
                                                                }
                                                            }
                                                            title={`Map showing location at ${selectedMessage?.latitude}, ${selectedMessage?.longitude}`}
                                                            frameborder="0"
                                                            src={`https://www.google.com/maps?q=${selectedMessage?.latitude},${selectedMessage?.longitude}&hl=es;z=14&output=embed`}
                                                            allowFullScreen
                                                        ></iframe>
                                                    </div>
                                                </div>
                                            ) : null
                                        }


                                    </div>
                                    <div className='col-md-1 '>
                                        <button className='btn'
                                            onClick={handleReplyClose}
                                        >
                                            <i class="fa-solid fa-x"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )

                    }



                    <div className="chat-input-container position-absolute   d-flex justify-content-center"
                        style={{
                            bottom: '1rem',
                            // left: '1rem',
                            width: '100%',
                        }}
                    >
                        <input
                            type="text"
                            className="form-control mx-2 rounded-3"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            style={{ border: 'none' }}
                        />

                        <div className='dropup'>
                            <button
                                className='btn'
                                data-bs-toggle='dropdown'
                                aria-expanded='false'
                                type='button'
                                style={{
                                    position: 'absolute',
                                    right: '3rem',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                }}
                            >
                                <img src={paperClip} style={{ width: '25px' }} alt="paperclip" />
                            </button>

                            <ul className='dropdown-menu chat-dropdown'>
                                <li>
                                    <button
                                        className='btn'
                                        onClick={handleImageButtonClick}
                                    > <span ><img src={imageChat} alt="imagechat" /></span>
                                        Image
                                    </button>
                                    <input
                                        type="file"
                                        id='imageInput'
                                        ref={imageInputRef}
                                        accept='image/*'
                                        style={{ display: 'none' }}
                                        onChange={handleImageSelect}
                                    />
                                </li>
                                <li>
                                    <button className='btn'
                                        onClick={handleVideoButtonClick}
                                    >
                                        <span><img src={videoChat} alt="video chat" /></span>
                                        Video
                                    </button>
                                    <input
                                        type="file"
                                        id='videoInput'
                                        ref={videoInputRef}
                                        accept='video/*'
                                        style={{ display: 'none' }}
                                        onChange={handleVideoSelect}
                                    />
                                </li>
                                <li>
                                    <button className='btn'
                                        onClick={handleGetLocation}
                                    >
                                        <span><img src={pinChat} alt=" pin chat" />  </span>
                                        Location
                                    </button>
                                </li>

                                <li>
                                    <button
                                        className='btn'
                                        onClick={handleDocumentButtonClick}
                                    >
                                        <span><img src={docIcon} alt=" doc chat" />  </span>
                                        Document
                                    </button>

                                    <input
                                        type="file"
                                        id='documentInput'
                                        ref={docInputRef}
                                        accept='application/pdf'
                                        style={{ display: 'none' }}
                                        onChange={handleDocumentSelect}
                                    />
                                </li>
                            </ul>


                        </div>


                        <button className="btn "
                            style={{
                                position: 'absolute',
                                right: '1rem',
                                border: 'none',
                                backgroundColor: 'transparent',
                            }}
                            onClick={handleSendMessage}>
                            <img src={paperPlan} alt="send" style={{ width: '25px' }} />
                        </button>
                    </div>

                    {/* send image model */}
                    <Modal show={showSendImage} onHide={handleCloseSendImage}>
                        <Modal.Header closeButton>
                            <Modal.Title>Send Image</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div>
                                <div className='d-flex  justify-content-center'>
                                    <img src={selectedImage ? URL.createObjectURL(selectedImage) : ''} alt="sendpick"
                                        style={{ width: "200px", height: "200px" }}
                                    />
                                </div>

                                <div className='text-center'>
                                    <h2 className='my-4' style={{ fontSize: "25px", fontWeight: "400" }}>Are you want to send this image ?</h2>
                                </div>

                                <div className='d-flex justify-content-center my-3'>
                                    <button className='btn py-2 me-2' style={{ width: "100%", backgroundColor: "#D32F2F", color: "white" }} onClick={handleSendImage}  >Yes</button>
                                    <button className='btn py-2 ms-2' style={{ width: "100%", border: "1px solid #9A9BA5" }} onClick={handleCloseSendImage}>cancal</button>
                                </div>



                            </div>
                        </Modal.Body>
                    </Modal>

                    {/* send video model */}

                    <Modal show={showSendVideo} onHide={handleCloseSendVideo}>
                        <Modal.Header closeButton>
                            <Modal.Title>Send Video</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div>
                                <div className='d-flex  justify-content-center'>
                                    <video src={selectedVideo ? URL.createObjectURL(selectedVideo) : ''} style={{ width: "200px" }}></video>
                                </div>

                                <div className='text-center'>
                                    <h2 className='my-4' style={{ fontSize: "25px", fontWeight: "400" }}>Are you want to send this video ?</h2>
                                </div>

                                <div className='d-flex justify-content-center my-3'>
                                    <button className='btn py-2 me-2' style={{ width: "100%", backgroundColor: "#D32F2F", color: "white" }} onClick={handleSendVideo} disabled={isLoading}>Yes</button>
                                    <button className='btn py-2 ms-2' style={{ width: "100%", border: "1px solid #9A9BA5" }} onClick={handleCloseSendVideo}>cancal</button>
                                </div>


                            </div>
                        </Modal.Body>
                    </Modal>

                    {/* send location */}

                    <Modal show={showSendLocation} onHide={handleCloseSendLocation}>
                        <Modal.Header closeButton>
                            <Modal.Title>Send Location</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div>
                                {locationError ? (
                                    <div>
                                        <p className='text-danger'>{locationError}</p>
                                    </div>
                                ) : (
                                    <div className='d-flex  justify-content-center'>
                                        <div
                                            style={{
                                                width: '200px',
                                                height: '200px',
                                                backgroundColor: '#d3d3d3',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                backgroundImage: `url("https://maps.googleapis.com/maps/api/staticmap?center=${location.lat},${location.lng}&zoom=15&size=600x300&key=AIzaSyA6UfWsoXt63QDE3phm0W1XMRBiO2xrUzo&libraries")`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                            }}
                                        >

                                        </div>
                                    </div>
                                )}

                                <div className='text-center'>
                                    <h2 className='my-4' style={{ fontSize: "25px", fontWeight: "400" }}>Are you want to send your location ?</h2>
                                </div>

                                <div className='d-flex justify-content-center my-3'>
                                    <button className='btn py-2 me-2'
                                        style={{ width: "100%", backgroundColor: "#D32F2F", color: "white" }}
                                        onClick={() => {
                                            // console.log(location);
                                            sendLocation();

                                        }}
                                    >
                                        Yes
                                    </button>
                                    <button className='btn py-2 ms-2' style={{ width: "100%", border: "1px solid #9A9BA5" }} onClick={handleCloseSendLocation}>cancal</button>
                                </div>

                            </div>
                        </Modal.Body>
                    </Modal>

                    {/* send docs */}

                    <Modal show={showSendDocument} onHide={handleCloseSendDocument}>
                        <Modal.Header closeButton>
                            <Modal.Title>Send Document</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div>
                                {selectedDocument && (
                                    <div className='d-flex  justify-content-center align-items-center'>
                                        <img src={docIcon} alt="document" style={{ width: "50px", height: "50px" }} />
                                        <p className='mb-0 pb-0'>{selectedDocument.name}</p>
                                    </div>
                                )}

                                <div className='text-center'>
                                    <h2 className='my-4' style={{ fontSize: "25px", fontWeight: "400" }}>Are you want to send this document ?</h2>
                                </div>

                                <div className='d-flex justify-content-center my-3'>
                                    <button className='btn py-2 me-2' style={{ width: "100%", backgroundColor: "#D32F2F", color: "white" }} onClick={handleSendDocument}>Yes</button>
                                    <button className='btn py-2 ms-2' style={{ width: "100%", border: "1px solid #9A9BA5" }} onClick={handleCloseSendDocument}>cancal</button>
                                </div>

                            </div>
                        </Modal.Body>
                    </Modal>

                    {/* show forward message */}

                    <Modal show={showForwardMessage} onHide={handleCloseForwardMessage}>
                        <Modal.Header closeButton>
                            <Modal.Title>Forward Message</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>

                            <div className="container-fluid ">
                                <div className='itemsColor pb-4 '>

                                    {/* Second line: Search input */}
                                    <div className="row">
                                        <div className="col search position-relative">
                                            <img src={search} alt="search"
                                                style={{
                                                    width: "25px",
                                                    height: "25px",
                                                    position: "absolute",
                                                    top: "0.7rem",
                                                    left: "1rem",
                                                }}
                                            />
                                            <input
                                                type="text"
                                                className="form-control my-2"
                                                placeholder="Search"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                style={{ paddingLeft: '2rem' }}
                                            />
                                        </div>
                                    </div>
                                    {/* Third line: Users */}
                                    <div style={{
                                        height: '25rem', overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: "none",
                                        msOverflowStyle: "none",
                                    }}>

                                        {loading ? <div className="text-center loader flex-grow-1 d-flex justify-content-center ">
                                            <ThreeDots
                                                height={80}
                                                width={80}
                                                color="green"
                                                ariaLabel="loading"
                                                wrapperStyle={{}}
                                                wrapperClass=""
                                                visible={true}
                                            />
                                        </div> : null}

                                        <div className="row">
                                            <div className="col ">
                                                {chatList
                                                    .filter(chat => {
                                                        if (chat.chatType === 1 || chat.chatType === 3 || chat.chatType === 5 || chat.chatType === 6 || chat.chatType === 7) {
                                                            return chat?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
                                                        } else if (chat.chatType === 2) {
                                                            return chat?.team?.teamName?.toLowerCase().includes(searchTerm.toLowerCase());
                                                        } else if (chat.chatType === 4) {
                                                            return chat?.event?.eventName?.toLowerCase().includes(searchTerm.toLowerCase());
                                                        }
                                                        return false;
                                                    })
                                                    .map((chat, index) => {

                                                        let decodedMessage;

                                                        try {
                                                            decodedMessage = atob(chat?.lastMessage); // Try to decode the lastMessage
                                                        } catch (error) {
                                                            // console.error("Failed to decode message:", chat.lastMessage, error);
                                                            decodedMessage = chat?.lastMessage;
                                                        }

                                                        return (
                                                            <div key={index}>
                                                                {chat.chatType === 1 && (
                                                                    <div className={`d-flex align-items-center media `}
                                                                        onClick={() => handleForwardMessage(chat)}
                                                                        style={{ cursor: "pointer" }}
                                                                    >
                                                                        <img
                                                                            src={chat?.user?.profileImage || profile}
                                                                            className="mr-4 rounded-circle"
                                                                            alt={chat.user.name}
                                                                            style={{ width: "50px", height: "50px" }}
                                                                        />
                                                                        <div className='media-text pt-2'>
                                                                            <h5 className="my-0">{chat.user?.name}</h5>
                                                                            <p>{truncateMessage(decodedMessage, 15)}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {chat.chatType === 2 && (
                                                                    <div className={`d-flex align-items-center media `}
                                                                        style={{ cursor: "pointer" }}
                                                                        onClick={() => handleForwardMessage(chat)}

                                                                    >
                                                                        <img
                                                                            src={chat?.team?.logo || grupProfile}
                                                                            className="mr-4 rounded-circle"
                                                                            alt={chat.user.name}
                                                                            style={{ width: "50px", height: "50px" }}
                                                                        />
                                                                        <div className='media-text pt-2 '>
                                                                            <h5 className="my-0">{chat?.team?.teamName}</h5>
                                                                            <p>{truncateMessage(decodedMessage, 25)}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {chat.chatType === 3 && (
                                                                    <div className={` d-flex align-items-center media`}
                                                                        style={{ cursor: "pointer" }}
                                                                        onClick={() => handleForwardMessage(chat)}

                                                                    >
                                                                        <img
                                                                            src={chat?.user?.profileImage || grupProfile}
                                                                            className="mr-4 rounded-circle"
                                                                            alt={chat.user.name}
                                                                            style={{ width: "50px", height: "50px" }}
                                                                        />
                                                                        <div className='media-text pt-2'>
                                                                            <h5 className="my-0">{chat.user?.name}</h5>
                                                                            <p>{truncateMessage(decodedMessage, 15)}</p>


                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {chat.chatType === 4 && (
                                                                    <div className={`d-flex align-items-center media`}
                                                                        style={{ cursor: "pointer" }}
                                                                        onClick={() => handleForwardMessage(chat)}

                                                                    >
                                                                        <div className='d-flex justify-content-center align-items-center rounded-circle'
                                                                            style={{
                                                                                border: "0.5px solid #ccc",
                                                                                width: "50px",
                                                                                height: "50px",
                                                                                marginRight: "1rem",
                                                                            }}
                                                                        >
                                                                            <img
                                                                                src={chat?.event?.sportId?.selected_image || grupProfile}
                                                                                alt={chat.user.name}
                                                                                style={chat?.event?.sportId?.selected_image ? { width: "25px", height: "25px", marginRight: "0" } : { width: "50px", height: "50px", borderRadius: "50%" }}
                                                                            />
                                                                        </div>
                                                                        <div className='media-text pt-2 '>
                                                                            <h5 className="my-0">{chat?.event?.eventName}</h5>
                                                                            <p>{truncateMessage(decodedMessage, 25)}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {chat.chatType === 5 && (
                                                                    <div className={`d-flex align-items-center media `}
                                                                        onClick={() => handleForwardMessage(chat)}

                                                                        style={{ cursor: "pointer" }}
                                                                    >
                                                                        <img
                                                                            src={chat?.user?.profileImage || grupProfile}
                                                                            className="mr-4 rounded-circle"
                                                                            alt={chat.user.name}
                                                                            style={{ width: "50px", height: "50px" }}
                                                                        />
                                                                        <div className='media-text pt-2'>
                                                                            <h5 className="my-0">{chat.user?.name}</h5>
                                                                            <p>{truncateMessage(decodedMessage, 15)}</p>

                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {chat.chatType === 6 && (
                                                                    <div className={`d-flex align-items-center media $`}
                                                                        onClick={() => handleForwardMessage(chat)}

                                                                    >
                                                                        <img
                                                                            src={chat?.user?.profileImage || 'default-image-url'}
                                                                            className="mr-4 rounded-circle"
                                                                            alt={chat.user.name}
                                                                            style={{ width: "50px", height: "50px" }}
                                                                        />
                                                                        <div className='media-text pt-2'>
                                                                            <h5 className="my-0">{chat.user?.name}</h5>
                                                                            <p>{truncateMessage(decodedMessage, 15)}</p>
                                                                            <small className="text-muted">training grrup chat</small>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {chat.chatType === 7 && (
                                                                    <div className={`d-flex py-1 align-items-center media $`}
                                                                        onClick={() => handleForwardMessage(chat)}

                                                                    >
                                                                        <img
                                                                            src={chat?.user?.profileImage || 'default-image-url'}
                                                                            className="mr-4 rounded-circle"
                                                                            alt={chat.user.name}
                                                                            style={{ width: "50px", height: "50px" }}
                                                                        />
                                                                        <div className='media-text pt-2'>
                                                                            <h5 className="my-0">{chat.user?.name}</h5>
                                                                            <p>{truncateMessage(decodedMessage, 15)}</p>
                                                                            <small className="text-muted">training facility admins and coaches group,</small>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {/* Add horizontal line between items */}
                                                                <hr className='my-0 p-0' style={{ border: '0.5px solid #ccc' }} />
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </Modal.Body>
                    </Modal>

                    {/* delete model */}

                    <Modal show={showDelete} onHide={handleCloseDeleteMessage} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Delete Message</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div>

                                <div className='text-center'>
                                    <h5>
                                        Are you sure you want to delete this Message?
                                    </h5>
                                </div>

                                <div className='d-flex justify-content-center mt-4'>
                                    <button className='btn btn-primary me-2'
                                        style={{ width: "100%" }}
                                        onClick={handleCloseDeleteMessage}
                                    >
                                        Close
                                    </button>
                                    <button className='btn btn-danger ms-2'
                                        style={{ width: "100%" }}
                                        onClick={handleDeleteMessage}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                        </Modal.Body>

                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default EventChats;
