import React, { useEffect, useState } from 'react';
import filter from "../../../assets/afterLogin picks/home/filter.png";
import "../../../assets/Styles/AfterLogin/chatbox.css"
import search from "../../../assets/afterLogin picks/home/Search.png"
import socketService from './WebSocketService';
import { useSelector } from 'react-redux';
import profile from "../../../assets/afterLogin picks/home/profile.jpg";
import grupProfile from "../../../assets/afterLogin picks/chats/grupPick.jpg"
import { ThreeDots } from 'react-loader-spinner';


const ChatComponent = ({ onChatSelect, eventId, selectedRoomId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [chatList, setChatList] = useState([]);
    const userData = useSelector((state) => state.auth.user.data.user);
    const [archive, setArchive] = useState(false);
    const [loading, setLoading] = useState(false);
    // console.log("event id in chat component", eventId);
    // console.log("chat list in chat component", chatList);

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
            console.log("Received chatUserList event:", data);
            setChatList(data?.result);
            setLoading(false);
        })

        return () => {
            socketService.removeListener('chatList');
        }
    }, [userData?._id, archive]);


  
    // useEffect(() => {
    //     console.log("this useEffected triger");
        
    //     const fetchChatList = () => {
    //         console.log("this function called");
            
    //         if (socketService.isConnected) {
    //             // If the socket is already connected, emit the event immediately
    //             console.log('Socket already connected, emitting chatList event');
    //             setLoading(true);
    //             socketService.emit('chatList', {
    //                 senderId: userData?._id,
    //                 isArchived: archive,
    //             });
    //         } else {
    //             // If the socket is not connected, wait for the connect event
    //             console.log('Socket not connected, waiting for connection to emit chatList event');
    //             socketService.on('connect', () => {
    //                 console.log('Socket connected, now emitting chatList event');
    //                 setLoading(true);
    //                 socketService.emit('chatList', {
    //                     senderId: userData?._id,
    //                     isArchived: archive,
    //                 });
    //             });
    //         }
    //     };
    
    //     fetchChatList();
    
    //     const handleChatUserList = (data) => {
    //         console.log("Received chatUserList event with data:", data);
    //         setChatList(data?.result || []);
    //         setLoading(false);
    //     };
    
    //     // Listen for the chatUserList event
    //     socketService.on('chatUserList', handleChatUserList);
    
    //     return () => {
    //         socketService.off('chatUserList', handleChatUserList);
    //     };
    // }, [userData?._id, archive]);
    
    



    const truncateMessage = (message, maxLength) => {
        if (message.length > maxLength) {
            return message.slice(0, maxLength) + '...';
        }
        return message;
    };

    const isBase64Encoded = (str) => {
        try {
            // Check if the string matches the base64 format
            return btoa(atob(str)) === str; // Decoding and re-encoding should give the same string
        } catch (error) {
            return false; // If it fails, it's not base64
        }
    };


    return (
        <div className="container-fluid ">
            <div className='itemsColor py-4 '>
                {/* First line: Heading and filter icon */}
                <div className="row align-items-center mb-3">
                    <div className="col">
                        <h6 className="mb-0">
                            All messages
                        </h6>
                    </div>
                    <div className="col-auto">
                        <img src={filter} alt="filter" className='filter archive' />
                    </div>
                </div>
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

                                    if(isBase64Encoded(chat?.lastMessage)){
                                        decodedMessage = atob(chat?.lastMessage);
                                    }else{
                                        decodedMessage = chat?.lastMessage
                                    }

                                    return (
                                        <div key={index}>
                                            {chat.chatType === 1 && (
                                                <div className={`d-flex align-items-center media ${selectedRoomId === chat.roomId ? 'selected-chat' : ''}`}
                                                    onClick={() => onChatSelect(chat.chatType, chat.roomId, chat)}
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
                                                        <p>{truncateMessage(decodedMessage, 20)}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {chat.chatType === 2 && (
                                                <div className={`d-flex align-items-center media ${selectedRoomId === chat.roomId ? 'selected-chat' : ''}`}
                                                    onClick={() => onChatSelect(chat.chatType, chat.roomId, chat)}
                                                    style={{ cursor: "pointer" }}
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
                                                <div className={` d-flex align-items-center media ${selectedRoomId === chat.roomId ? 'selected-chat' : ''}`}
                                                onClick={() => onChatSelect(chat.chatType, chat.roomId, chat)}
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
                                            {chat.chatType === 4 && (
                                                <div className={`d-flex align-items-center media ${selectedRoomId === chat.roomId ? 'selected-chat' : ''}` }
                                                    onClick={() => onChatSelect(chat.chatType, chat.roomId, chat)}
                                                    style={{ cursor: "pointer" }}
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
                                                <div className={`d-flex align-items-center media ${selectedRoomId === chat.roomId ? 'selected-chat' : ''}`}
                                                    onClick={() => onChatSelect(chat.chatType, chat.roomId, chat)}
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
                                                <div className={`d-flex align-items-center media ${selectedRoomId === chat.roomId ? 'selected-chat' : ''}` }>
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
                                                <div className= {`d-flex py-1 align-items-center media ${selectedRoomId === chat.roomId ? 'selected-chat' : ''}`}>
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
    );
};

export default ChatComponent;
