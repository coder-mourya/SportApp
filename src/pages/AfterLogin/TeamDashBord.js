import React, { useEffect } from "react";
import Sidebar from "../../components/AfterLogin/Sidebar";
import SidebarSmallDevice from "../../components/AfterLogin/SidebarSmallDevice";
import { useState } from "react";
import arrow from "../../assets/afterLogin picks/My team/arrow.svg";
import seting from "../../assets/afterLogin picks/My team/admin_selected.svg";
import Delete from "../../assets/afterLogin picks/My team/delete.svg";
import "../../assets/Styles/AfterLogin/createTeam.css"
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import invite from "../../assets/afterLogin picks/My team/invite.svg";
import download from "../../assets/afterLogin picks/My team/download.svg";
import share from "../../assets/afterLogin picks/My team/share.svg";
import pen from "../../assets/afterLogin picks/pen.png";
import Modal from 'react-bootstrap/Modal';
import { FacebookShareButton, TwitterShareButton, LinkedinShareButton, EmailShareButton } from 'react-share';
import { FacebookIcon, TwitterIcon, LinkedinIcon, EmailIcon } from 'react-share';
import axios from "axios";
import { BaseUrl } from "../../reducers/Api/bassUrl";
import Offcanvas from "react-bootstrap/Offcanvas";
import AddTeamMember from "../../components/AfterLogin/CreateTeam/AddTeamMember";
import { useSelector } from "react-redux";
import logo from "../../assets/img/logo.png";
import AddAboutMe from "../../components/AfterLogin/CreateTeam/AddAbout";
import EditTeam from "../../components/AfterLogin/CreateTeam/EditTeam";
import { ToastContainer, toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import EditMember from "../../components/AfterLogin/CreateTeam/EditMember";
import CreatorDetails from "../../components/AfterLogin/CreateTeam/CreatorDetails";
import admin from "../../assets/afterLogin picks/My team/admin.svg";





const TeamDashbord = () => {

    const [mainContainerClass, setMainContainerClass] = useState('col-md-11');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { team } = location.state;
    const [show, setShow] = useState(false);
    const [currentTeam, setCurrentTeam] = useState(null);
    const [teamDetails, setTeamDetails] = useState(null);
    const token = useSelector(state => state.auth.user.data.user.token);
    const currentUser = useSelector(state => state.auth.user.data.user);

    // console.log("current user", currentUser);

    const shareUrl = 'https://sportsnerve.com/';
    const title = 'Sports Nerve';
    // console.log(`reciving team data`, team);


    const handleCloseModal = () => {
        setShow(false);
    };

    const handleShow = () => setShow(true);

    // for add member
    const [showAddMember, setShowAddMember] = useState(false);
    const handleShowAddMember = () => setShowAddMember(true);
    const handleCloseAddMember = () => setShowAddMember(false);

    // for edit team 
    const [showEditTeam, setShowEditTeam] = useState(false);
    const handleShowEditTeam = () => {
        setShowEditTeam(true);
    };

    const handleCloseEditTeam = () => setShowEditTeam(false);
    const [invitedMember, setInvitedMember] = useState({});

    // for invite accept and reject
    const [showInvite, setShowInvite] = useState(false);
    const handleShowInvite = (member) => {
        setShowInvite(true);
        setInvitedMember(member)
        console.log(member);
    }
    const handleCloseInvite = () => setShowInvite(false);

    useEffect(() => {
        if (teamDetails && teamDetails.members) {
            const pendingMember = teamDetails.members.find(member => member.requestStatus === 1 && member.memberId === currentUser._id);
            if (pendingMember) {
                handleShowInvite(pendingMember);
            }
        }
    }, [teamDetails, currentUser._id]);


    // for fill about me 
    const [showAboutMe, setShowAboutMe] = useState(false);
    const handleShowAboutMe = () => {
        setShowAboutMe(true)
    }
    const handleCloseAboutMe = () => setShowAboutMe(false);

    useEffect(() => {
        if (teamDetails && teamDetails.members) {

            const memberWithoutJerseyDetails = teamDetails.members.find(member => member.jerseyDetails === null && currentUser._id === member.memberId && member.requestStatus === 2 && teamDetails.user_id !== currentUser._id);
            if (memberWithoutJerseyDetails) {
                handleShowAboutMe();
            }
        }
    }, [teamDetails, currentUser._id]);


    const [ShowEditMember, setShowEditMember] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const handleShowEditMember = (member) => {

        setSelectedMember(member);
        setShowEditMember(true);
    };

    const handleCloseEditMember = () => {
        setSelectedMember(null);
        setShowEditMember(false);
    };

    const handleMemberNavigation = (member) => {
        // console.log("member", member);
        if (member.requestStatus === 1) {
            alert("The user didn't Accepted your Invite")
        } else if (member.jerseyDetails === null) {
            alert("The user didn't introduce yet.");
        } else {
            handleShowEditMember(member);
        }
    };

    const [showCreatorDetails, setShowCreatorDetails] = useState(false);
    const [creatorDetails, setCreatorDetails] = useState(null);
    const handleShowCreatorDetails = (creator) => {
        setCreatorDetails(creator);
        setShowCreatorDetails(true);
    };

    const closeCreatorDetails = () => {
        setCreatorDetails(null)
        setShowCreatorDetails(false);
    }



    const handleCopy = () => {
        // Create a temporary input element
        const tempInput = document.createElement('input');
        tempInput.value = shareUrl; // Use the share URL

        // Append the input to the body
        document.body.appendChild(tempInput);

        // Select the input
        tempInput.select();
        tempInput.setSelectionRange(0, 99999); // For mobile devices

        // Copy the URL to the clipboard
        document.execCommand('copy');

        // Remove the temporary input
        document.body.removeChild(tempInput);

        // Optionally, show a toast or notification to indicate that the link has been copied
        // You can use libraries like react-toastify for this
    };


    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
        setMainContainerClass(sidebarOpen ? 'col-md-11 ' : 'col-md-10 ');
    };

    const Navigate = useNavigate();
    const handleCrose = () => {
        Navigate('/CreateTeam')
    }

    // down team details 
    const handleDownload = async () => {
        const downloadUrl = BaseUrl();
        try {
            const response = await axios.get(`${downloadUrl}/api/v1/user/team/membersList/download/${team._id}`, {
                responseType: 'blob', // important
            });

            // Create a URL for the file
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${team.teamName}_membersList.csv`); // or any other file extension
            document.body.appendChild(link);
            link.click();

            // Clean up and remove the link
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Error downloading the file', error);
        }
    };



    useEffect(() => {
        // get team details
        const getTeamDetails = async () => {
            const teamDetailsUrl = BaseUrl();
            try {
                const response = await axios.get(`${teamDetailsUrl}/api/v1/user/team/details/${team._id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                setTeamDetails(response.data.data.teamDetails);
                console.log(`team details`, response.data.data.teamDetails);
            } catch (error) {
                console.error("Error fetching team details:", error);
            }
        };
        getTeamDetails();
    }, [token, team._id]);





    // funnction for accept and reheject invite

    const handleInvite = async (teamId, status) => {
        const inviteUrl = BaseUrl();

        let data = {
            teamId: teamId,
            status: status,


        }

        if (invitedMember?._id) {
            data["memberId"] = invitedMember?._id
        }


        console.log("checck data", data);
        // return;

        try {
            const response = await axios.post(`${inviteUrl}/api/v1/user/team/request/accept-reject`, data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

            console.log("checck response ", response);


            if (response.data.status === 200) {
                const updatedMemberId = response.data;
                console.log("updatedMemberId", updatedMemberId);

                setTeamDetails(prevState => {
                    const updatedMembers = prevState.members.map(member => {
                        if (member.memberId === updatedMemberId) {
                            return { ...member, requestStatus: status };
                        }
                        return member;
                    });
                    return { ...prevState, members: updatedMembers };
                });

                toast.success(response.data.message);
                handleCloseInvite();
                window.location.reload()
                // handleShowAboutMe();
            } else {
                toast.error(response.data.message); // Handle error messages
            }



        } catch (error) {
            console.error('Error handling invite:', error);
        }
    };





    // delete member
    const handleDeleteMember = async (member, teamId) => {

        // let isGoBack = false;

        let data = {
            teamId: teamId,
        };

        if (member.memberId == null) {
            data["member_id"] = member._id;
            if (member._id === currentUser?._id) {
                //   isGoBack = true;
            }
        } else {
            data["memberId"] = member.memberId;
            if (member.memberId === currentUser?._id) {
                //   isGoBack = true;
            }
        }

        const deleteUrl = BaseUrl();
        try {
            const response = await axios.put(`${deleteUrl}/api/v1/user/team/member/delete`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })

            if (response.data.status === 200) {
                console.log("response", response.data);


                setTeamDetails(prevState => {
                    // Filter out the deleted member from the previous state
                    const updatedMembers = prevState.members.filter(m => m._id !== member._id);
                    return { ...prevState, members: updatedMembers };
                });

                const message = response.data.message;
                toast.success(message)

            }

        } catch (error) {
            console.error('Error deleting member:', error);
        }

    }

    // Alert for when user click on admin of creator 
    const handleAlert = () => {
        alert("Can't change Admin status of creator")
    }


    // handle admin status
    const handleAdminStatusChange = async (member) => {
        // console.log(member);
        if (!teamDetails.admins.includes(currentUser._id)) {
            alert("You are not an admin of this team, you can't change the admin status");
            return;
        }


        let isAdmin = member.isAdmin;
        // console.log(isAdmin);
        let status;

        if (isAdmin) {
            status = false;
        } else {
            status = true;
        }


        let data = {
            teamId: team._id,
            memberId: member.memberId,
            isAdmin: status
        }

        // console.log("check what data sending ", data);
        


        const url = BaseUrl();
        try {
            const response = await axios.put(`${url}/api/v1/user/team/change/adminStatus/member`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (response.data.status === 200) {
                console.log(response.data);
                toast.success(response.data.message)

                setTeamDetails(prevState => {
                    // Update the admin status of the member
                    const updatedMembers = prevState.members.map(m =>
                        m.memberId === member.memberId ? { ...m, isAdmin: status } : m
                    );
                    return { ...prevState, members: updatedMembers };
                });


            } else {
                console.log(response.data);
                toast.error(response.data.message)
            }

        } catch (error) {
            console.error('Error updating  member:', error);

        }
    }







    return (
        <div className="container-fluid   bodyColor">

            <div className="row">
                <div className="col">
                    <Sidebar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                    <SidebarSmallDevice />
                </div>

                <div className={`${mainContainerClass}  main mt-5 mt-md-3 `}>

                    <ToastContainer />


                    <div className=" team-dashbord">

                        <div className="d-flex">
                            <button className="btn  prev-button me-3" onClick={handleCrose} style={{
                                height: "40px",

                            }}><img src={arrow} alt="prevus" /></button>
                            <h3>{team.teamName}</h3>
                        </div>

                        <div className="dashbord-container itemsColor rounded p-3 mt-4">
                            <Modal show={show} onHide={handleCloseModal} >
                                <Modal.Header closeButton>
                                    <Modal.Title>
                                        {currentTeam && <img src={currentTeam.logo} alt="team logo"
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                borderRadius: "50%"
                                            }} />}
                                    </Modal.Title>
                                    <p className="ms-3 pt-2">Join team KKR on Sports Nerve!</p>
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

                            <div className="team-banner rounded d-flex justify-content-center align-items-center">
                                <div className="text-center">
                                    <div className="edit-penAndshare">
                                        <button className="btn share d-flex justfify-content-center me-2" onClick={(e) => {
                                            setCurrentTeam(team);
                                            handleShow();
                                        }}>
                                            <img src={share} alt="" />
                                            <p className="ms-2">Share</p>
                                        </button>

                                        {teamDetails && teamDetails.members.some(member => member.memberId === currentUser._id && member.isAdmin) && (
                                            <button className="btn pen ms-2" onClick={handleShowEditTeam}>
                                                <img src={pen} alt="" />
                                            </button>
                                        )}

                                    </div>
                                    <img src={team.coverPhoto} alt="cover-pick" className="cover-pick" />
                                    <img src={team.logo} alt="teamlogo" className="teamlogo" />
                                    <p className=" team-Name">{team.teamName}</p>


                                    <div className="d-flex justify-content-center  sports-icons  px-2 ">
                                        <div className="mx-1 d-flex  align-items-center">
                                            <img src={team.sport.selected_image} alt="sporticon" style={{ width: "25px", height: "25px" }} />
                                        </div>
                                        <div className="mx-1">
                                            <p className="sport-text" style={{ fontSize: "14px", paddingTop: "4px" }}>
                                                {/* slice text in small screens */}
                                                {window.innerWidth <= 1284 ? (
                                                    team.sport.sports_name.slice(0, 7) + ".."
                                                ) : (
                                                    team.sport.sports_name
                                                )}</p>
                                        </div>
                                    </div>
                                </div>


                            </div>

                            <div className="d-flex  justify-content-between containter-fluid my-2">

                                <div>
                                    <h4>Member List</h4>
                                </div>

                                <div className="d-flex justify-content-center donload-invite">
                                    <img src={download} alt="download" className="download me-3" onClick={handleDownload} />


                                    {teamDetails && teamDetails.members.some(member => member.memberId === currentUser._id && member.isAdmin) && (
                                        <img
                                            src={invite}
                                            alt="invite"
                                            className="invite ms-3"
                                            onClick={handleShowAddMember}
                                        />
                                    )}


                                </div>

                            </div>
                            <div className="members-list mt-2">
                                <div className="row">
                                    {teamDetails?.creatorIsAdmin && (
                                        <div className="col-md-4" key={teamDetails.aboutCreator._id}>
                                            <div className="d-flex align-items-center border p-2 my-2 my-md-3 rounded-4">
                                                <div className="you" style={{ cursor: "pointer" }} onClick={() => handleShowCreatorDetails(teamDetails.aboutCreator)}>
                                                    <img src={teamDetails.aboutCreator.creatorImage} alt="creator" style={{ width: "88px", height: "88px", borderRadius: "12px" }} />
                                                </div>
                                                <div className="p-2 flex-grow-1">
                                                    <div className="d-flex align-items-center">
                                                        <div className=" flex-grow-1">
                                                            <p className="text-muted mb-1 ms-2">created by</p>
                                                            <p className="ms-2">
                                                                {teamDetails.user_id === currentUser._id ? 'You' : teamDetails.aboutCreator.aboutCreator}
                                                            </p>
                                                        </div>
                                                        <div className="d-flex align-items-center ms-auto">
                                                            <img src={seting} alt="settings"
                                                                style={{ cursor: "pointer" }}
                                                                onClick={handleAlert}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {teamDetails?.members.map((member) => {
                                        // Skip rendering if memberId is the same as the creator's user_id
                                        if (member.memberId === teamDetails.user_id) {
                                            return null;
                                        }

                                        let content;

                                        if (member.requestStatus === 2) {
                                            content = (
                                                <div className="d-flex align-items-center">
                                                    <p className="mt-2 mb-1 ms-2">{member.fullName}</p>
                                                    {teamDetails && teamDetails.members.some(member => member.memberId === currentUser._id && member.isAdmin) && (
                                                        <div className="d-flex align-items-center ms-auto">
                                                            <img
                                                                src={Delete}
                                                                alt="delete"
                                                                onClick={() => handleDeleteMember(member, team._id)}
                                                                style={{ zIndex: 100, cursor: "pointer" }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        } else if (member.requestStatus === 1) {
                                            content = (
                                                <div className="d-flex align-items-center">
                                                    <p className="mt-2 mb-1 ms-2">{member.fullName}</p>
                                                    <div className="d-flex align-items-center ms-auto">
                                                        <p style={{
                                                            color: 'red',
                                                            paddingRight: '10px',
                                                            cursor: "pointer",
                                                            position: 'relative',
                                                        }}
                                                            className="pending"

                                                        // onClick={() => handleDeleteMember(member, team._id)}
                                                        >

                                                            Pending</p>

                                                        <button
                                                            style={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                right: 0,
                                                                display: 'none',
                                                                cursor: "pointer",
                                                                padding: '5px 10px',
                                                                backgroundColor: '#f8d7da',
                                                                border: '1px solid #f5c6cb',
                                                                borderRadius: '5px',
                                                                zIndex: 10
                                                            }}
                                                            className="remove-button"
                                                            onClick={() => handleDeleteMember(member, team._id)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        } else if (member.requestStatus === 3) {
                                            return null; // Skip rendering this member
                                        } else {
                                            content = (
                                                <>
                                                    <p className="mt-2 mb-1 ms-2">{member.fullName}</p>
                                                </>
                                            );
                                        }

                                        return (
                                            <div className="col-md-4" key={member._id}>
                                                <div className="d-flex align-items-center border p-2 my-2 my-md-3 rounded-4">
                                                    <div className="you" style={{ cursor: "pointer" }} onClick={() => handleMemberNavigation(member)}>
                                                        {member.requestStatus === 1 ? (
                                                            <img src={logo} alt="you"
                                                                style={{
                                                                    width: "88px",
                                                                    height: "88px",
                                                                    borderRadius: "12px",
                                                                }}
                                                            />
                                                        ) : (
                                                            <img src={member.profileImage} alt="member"
                                                                style={{
                                                                    width: "88px",
                                                                    height: "88px",
                                                                    borderRadius: "12px",
                                                                }}
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="p-2 flex-grow-1">
                                                        {content}
                                                    </div>


                                                    {member.requestStatus === 2 && (
                                                        <div className="d-flex align-items-center ms-auto">
                                                            <img
                                                                src={member.isAdmin ? seting : admin}
                                                                alt={member.isAdmin ? "settings" : "admin"}
                                                                style={{
                                                                    marginLeft: "10px",
                                                                    cursor: "pointer",
                                                                    width: "48px",
                                                                    height: "48px",
                                                                }}

                                                                onClick={() => handleAdminStatusChange(member)}
                                                            />
                                                        </div>
                                                    )}



                                                </div>
                                            </div>
                                        );
                                    })}

                                </div>
                            </div>






                        </div>
                    </div>

                    <Offcanvas show={showAddMember} onHide={handleCloseAddMember} placement="end" >
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title>Add Member</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <AddTeamMember team={team} handleCloseAddMember={handleCloseAddMember} />
                        </Offcanvas.Body>
                    </Offcanvas>


                    <Offcanvas show={showEditTeam} onHide={handleCloseEditTeam} placement="end" className="edit-team-offcanvas">
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title>Edit Team</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <EditTeam team={team} handleCloseEditTeam={handleCloseEditTeam} />
                        </Offcanvas.Body>
                    </Offcanvas>


                    <Offcanvas show={showInvite} onHide={handleCloseInvite} placement="end">
                        <Offcanvas.Header closeButton >
                            <Offcanvas.Title style={{ paddingLeft: "10rem" }} >

                                <img src={logo} alt="logo" className="logo" />


                            </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <div className="invite">
                                <div>
                                    <p>Hi "{currentUser?.fullName}" We are excited to have you on team </p>
                                </div>
                                <div className="d-flex">
                                    <button className="btn reject me-1"
                                        style={{
                                            width: "100%",
                                            color: "red",
                                            border: "1px solid red",
                                        }}
                                        onClick={() => handleInvite(team._id, 'reject')}
                                    >
                                        Decline
                                    </button>

                                    <button className="btn btn-danger accept ms-1"
                                        style={{ width: "100%" }}
                                        onClick={() => handleInvite(team._id, 'accept')}
                                    >
                                        Accept
                                    </button>
                                </div>
                            </div>
                        </Offcanvas.Body>
                    </Offcanvas>

                    <Offcanvas show={showAboutMe} onHide={handleCloseAboutMe} placement="end"  >
                        <Offcanvas.Header >
                            <Offcanvas.Title>About me</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <AddAboutMe teamId={team._id} handleCloseAboutMe={handleCloseAboutMe} />
                        </Offcanvas.Body>
                    </Offcanvas>


                    <Offcanvas show={ShowEditMember} onHide={handleCloseEditMember} placement="end"  >
                        <Offcanvas.Header >
                            <Offcanvas.Title>About me</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <EditMember teamId={team._id} selectedMember={selectedMember} handleCloseEditMember={handleCloseEditMember} />
                        </Offcanvas.Body>
                    </Offcanvas>

                    <Offcanvas show={showCreatorDetails} onHide={closeCreatorDetails} placement="end"  >
                        <Offcanvas.Header >
                            <Offcanvas.Title>About creator</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <CreatorDetails
                                team={team}
                                closeCreatorDetails={closeCreatorDetails}
                                creatorDetails={creatorDetails}
                            />
                        </Offcanvas.Body>
                    </Offcanvas>



                </div>
            </div>
        </div>
    )
}

export default TeamDashbord; 