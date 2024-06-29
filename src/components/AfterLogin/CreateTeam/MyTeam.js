import React, { useEffect } from "react";
import team from "../../../assets/afterLogin picks/My team/team.svg";
import "../../../assets/Styles/colors.css";
import share from "../../../assets/afterLogin picks/My team/share.svg";
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from "react-router-dom";
// import { BaseUrl } from "../../../reducers/Api/bassUrl"
// import axios from "axios";
import { useDispatch } from "react-redux";
import { useSelector} from "react-redux";
import { fetchTeams } from "../../../reducers/teamSlice";
import { useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import { FacebookShareButton, TwitterShareButton, LinkedinShareButton, EmailShareButton, WhatsappShareButton,  InstapaperShareButton, TelegramShareButton } from 'react-share';
import { FacebookIcon, TwitterIcon, LinkedinIcon, EmailIcon, WhatsappIcon, InstapaperIcon, TelegramIcon } from 'react-share';
import { ToastContainer, toast } from "react-toastify";

const MyTeam = () => {
    const token = useSelector(state => state.auth.user.data.user.token);
    const currentUser = useSelector(state => state.auth.user.data.user);
    // const [myteams, setMyTeams] = useState([]);
    const Navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [currentTeam, setCurrentTeam] = useState(null);
    const [shareUrl, setShareUrl] = useState('');
    const [title, setTitle] = useState('');
    const dispatch = useDispatch();
    const teams = useSelector(state => state.teams.teams);

    // console.log("teams", teams);

    
    const [show, setShow] = useState(false)

    // console.log("current user", currentUser);

    const handleCloseModal = () => {
        setShow(false);
    };

    const handleShow = (shareUrl) => {
        setShow(true);
        setShareUrl(shareUrl);
    };

  


    useEffect(() =>{
        dispatch(fetchTeams(token))

    }, [token, dispatch])

    useEffect(() =>{
        if(teams.length > 0){
            setLoading(false)
        }
    }, [teams])


    // navigate to team dashbord
    const handleTeamDashbord = (team) => {
        Navigate("/TeamDashbord", { state: { team } })
    }


    const handleShareButtonClick = (e, team) => {
        e.stopPropagation();
        const teamShareUrl = `${window.location.origin}/join-team/${team._id}`;
        const title = `Hey, we are using a new app, Sports Nerve, for our team event & activity planning. Click the link, download the app & join ${team.teamName} now!`;
        setCurrentTeam(team);
        setTitle(title);
        handleShow(teamShareUrl);
    };
    
    




    const handleCopy = (e) => {
        e.stopPropagation()

        const tempInput = document.createElement('input');
        tempInput.value = shareUrl; // Use the share URL
        document.body.appendChild(tempInput);
        tempInput.select();
        tempInput.setSelectionRange(0, 99999); // For mobile devices

        document.execCommand('copy');

        // Remove the temporary input
        document.body.removeChild(tempInput);
        toast.success('Link copied to clipboard!');
    };


    return (
        <div className="container-fluid itemsColor myTeam rounded dashbords-container-hieght ">
            <ToastContainer />
            {loading ? (
                <div className="text-center loader">
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
                teams.length === 0 ? (
                    <div className="row justify-content-center align-items-center p-5">
                        <div className="col-12 text-center">
                            <img src={team} alt="team pick" className="img-fluid mb-3" />
                            <p className="mb-0">You have no team here.</p>
                        </div>
                    </div>
                ) : (
                    <div className="row justify-content-start align-items-center p-md-2">
                        {teams.map((team, index) => (

                            <div key={index} className="col-12 col-md-6 mb-3 mt-2  ">

                                <div className="d-flex align-items-center teams-container p-3"
                                    onClick={() => handleTeamDashbord(team)}

                                    style={{
                                        backgroundColor: team.colour.colour,
                                        borderColor: team.colour.border_colour,
                                    }}
                                    
                                    >
                                    {/* Step 1: Image (unchanged) */}
                                    <img src={team.logo} className="card-img-top main-pick" alt="Team" />

                                    {/* Step 2: Team Name and Sport Icon */}
                                    <div className="ms-3 ">
                                        <div className="teamName   mb-3">
                                            <h5 className="card-title">{team.teamName}</h5>
                                        </div>

                                        <p className="py-0">Created by <span className="text-muted" >
                                            {currentUser._id === team.creatorDetails._id ? "You" : team.creatorDetails.fullName}
                                        </span></p>


                                        <div className="d-flex justify-content-center  sportIcon px-2 ">
                                            <div className="mx-2 d-flex  align-items-center">
                                                <img src={team.sport.selected_image} alt="sporticon" style={{ width: "25px", height: "25px" }} />
                                            </div>


                                            <div className="mx-2 ">
                                                <p className="sport-text">
                                                    {/* slice text in small screens */}
                                                    {window.innerWidth <= 1284 ? (
                                                        team.sport.sports_name.slice(0, 7) + ".."
                                                    ) : (
                                                        team.sport.sports_name
                                                    )}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 3: Share Buttons */}
                                    <div className="ms-auto d-flex ">



                                        {team.isPending ? (
                                            <p style={{ color: "red" }}>Pending</p>
                                        ) : (
                                            <img src={share} alt="share"
                                                className="mx-2 share-btn"
                                                onClick={(e) => handleShareButtonClick(e, team)}
                                            />
                                        )}

                                    </div>

                                    <Modal show={show} onHide={handleCloseModal}    
                                    backdrop="static"
                                    >
                                        <Modal.Header closeButton onClick={(e) => e.stopPropagation()}>
                                            <Modal.Title>
                                                {currentTeam && <img src={currentTeam.logo} alt="team logo"
                                                    style={{
                                                        width: "50px",
                                                        height: "50px",
                                                        borderRadius: "50%"
                                                    }} />}
                                            </Modal.Title>
                                            <p className="ms-3 pt-2">Join team {currentTeam && currentTeam.teamName} on Sports Nerve!</p>
                                        </Modal.Header>
                                        <Modal.Body>

                                            <div className="py-3" >
                                                {/* Facebook Share Button */}
                                                <FacebookShareButton url={shareUrl} quote={title} onClick={(e) => e.stopPropagation()}>
                                                    <FacebookIcon size={50} round />
                                                </FacebookShareButton>

                                                {/* Twitter Share Button */}
                                                <TwitterShareButton url={shareUrl} title={title} onClick={(e) => e.stopPropagation()}>
                                                    <TwitterIcon size={50} round />
                                                </TwitterShareButton>

                                                {/* LinkedIn Share Button */}
                                                <LinkedinShareButton url={shareUrl} title={title} onClick={(e) => e.stopPropagation()}>
                                                    <LinkedinIcon size={50} round />
                                                </LinkedinShareButton>

                                                {/* Email Share Button */}
                                                <EmailShareButton url={shareUrl} subject={title} onClick={(e) => e.stopPropagation()}>
                                                    <EmailIcon size={50} round />
                                                </EmailShareButton>

                                                <WhatsappShareButton url={shareUrl} title={title} onClick={(e) => e.stopPropagation()}>
                                                    <WhatsappIcon size={50} round />
                                                </WhatsappShareButton>

                                                <InstapaperShareButton url={shareUrl} title={title} onClick={(e) => e.stopPropagation()}>
                                                    <InstapaperIcon size={50} round />
                                                </InstapaperShareButton>

                                                <TelegramShareButton url={shareUrl} title={title} onClick={(e) => e.stopPropagation()}>
                                                    <TelegramIcon size={50} round />
                                                </TelegramShareButton>
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
                                </div>
                            </div>
                        ))}
                    </div>

                )
            )

            }
        </div>
    );
}

export default MyTeam;
