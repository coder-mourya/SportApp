import React, { useState } from "react";
import Sidebar from "../../components/AfterLogin/Sidebar";
import SidebarSmallDevice from "../../components/AfterLogin/SidebarSmallDevice";
import arrow from "../../assets/afterLogin picks/My team/arrow.svg";
import "../../assets/Styles/AfterLogin/createTeam.css";
import { useNavigate } from "react-router-dom";
import ChatComponent from "../../components/AfterLogin/Chats/ChatComponent";
import EventChats from "../../components/AfterLogin/Chats/EventChats";
import { useLocation } from "react-router-dom";




const ChatsScreenDashBord = () => {
    const location = useLocation();
    const [mainContainerClass, setMainContainerClass] = useState("col-md-11");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedChat, setSelectedChat] = useState({ chatType: null, roomId: null });
    const [info , setInfo] = useState({info: null});
    const eventId = location.state
    // console.log("event is in chatDashbord", eventId);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
        setMainContainerClass(sidebarOpen ? "col-md-11" : "col-md-10");
    };


    const Naviaget = useNavigate();

    const handleClose = () => {
        Naviaget("/LoggedInHome")
    }
    
    const [selectedRoomId, setSelectedRoomId] = useState(null); // State to store the 
    const handleChatSelect = (chatType, roomId, chat) => {
        setSelectedChat({ chatType, roomId });
        setInfo({chat})
        setSelectedRoomId (roomId);
    };

    

    return (
        <div className="container-fluid bodyColor ">
            <div className="row">
                <div className="col">
                    <Sidebar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                    <SidebarSmallDevice />
                </div>
                <div className={`${mainContainerClass} main mt-3`}>
                    <div className="member-dashbord">
                        <div className="d-flex align-items-center">
                            <button className="btn prev-button" onClick={handleClose}>
                                <img src={arrow} alt="previous" />
                            </button>

                            <h4 className="ms-3">Messages</h4>
                        </div>

                        <div className="row my-4">

                            <div className="col-md-4">
                                <div className=" rounded-4  itemsColor"
                                    style={{
                                        height: "100%",
                                    }}
                                >
                                    <ChatComponent  onChatSelect={handleChatSelect} selectedRoomId={selectedRoomId} eventId={eventId}/>
                                </div>

                            </div>

                            <div className="col-md-8">

                                <div className=" rounded-4  itemsColor "
                                style={{
                                    height: "100%"}}
                                >
                                    <EventChats chatType={selectedChat.chatType} roomId={selectedChat.roomId} info={info} eventId={eventId} />
                                </div>

                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatsScreenDashBord;
