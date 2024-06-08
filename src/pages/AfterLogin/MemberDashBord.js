import React from "react";
import Sidebar from "../../components/AfterLogin/Sidebar";
import SidebarSmallDevice from "../../components/AfterLogin/SidebarSmallDevice";
import { useState, useEffect } from "react";
import arrow from "../../assets/afterLogin picks/My team/arrow.svg";
import "../../assets/Styles/AfterLogin/createTeam.css"
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { BaseUrl } from "../../reducers/Api/bassUrl";
import { useSelector } from "react-redux";
import axios from "axios";
import team from "../../assets/afterLogin picks/My team/team.svg";
import { ThreeDots } from "react-loader-spinner";
import Offcanvas from "react-bootstrap/Offcanvas";
import { ToastContainer, toast } from "react-toastify";




const MemberDashBord = () => {

    const [mainContainerClass, setMainContainerClass] = useState('col-md-11');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const { member } = location.state || {};
    const token = useSelector(state => state.auth.user.data.user.token);
    const user = useSelector(state => state.auth.user.data.user);
    const [teams, setTeams] = useState([]);
    const [allTeams, setAllTeams] = useState([]);
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    // console.log("reciving member data", member);

    // const [formData, setFormData] = useState({
    //     teamId: "",
    //     image: member.image,
    //     fullName: member.fullName,
    //     mobile: member.mobile,
    //     email: member.email,
    //     isAdmin: false,
    //     memberId: member.memberId,
    // })





    const [showAddMember, setShowAddMember] = useState(false);
    const handleShowAddMember = () => setShowAddMember(true);
    const handleCloseAddMember = () => setShowAddMember(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
        setMainContainerClass(sidebarOpen ? 'col-md-11 ' : 'col-md-10 ');
    };


    const Naviaget = useNavigate();

    const handleClose = () => {
        Naviaget("/CreateTeam")
    }





    useEffect(() => {

        // get teams
        const teamUrl = BaseUrl()


        const getTeam = async () => {
            try {
                const response = await axios.get(`${teamUrl}/api/v1/user/myteams/list`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                if (response.status === 200) {
                    const teamData = response.data.data.teamData.teamList;
                    // console.log("gettng teams before filter", teamData);
                    setAllTeams(teamData)
                    const filteredTeam = teamData.filter(team => member.teamIds.includes(team._id));
                    setTeams(filteredTeam)
                    // console.log("gettng teams after filter", filteredTeam);
                } else {
                    console.log("unable to get teams");
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        getTeam()
    }, [token, member.teamIds])

    const handleTeamSelecte = (teamId) => {
        // console.log("selected team id", teamId);
        setSelectedTeamId(teamId);
    }


    const handleInvite = async () => {
        const url = BaseUrl();

        let formData = new FormData();
        formData.append('teamId', selectedTeamId);
        formData.append('memberId', member.memberId);
        formData.append('isAdmin', 'false');
        formData.append('fullName', member.fullName);
        formData.append('email', member.email);
        formData.append('image', member.image);
        formData.append('mobile', member.mobile)


        // console.log("invite data", ...formData);
        

        try {
            const response = await axios.post(`${url}/api/v1/user/team/add-member`, formData,  {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            })

            if (response.data.status === 200) {
                console.log("invite sent successfully", response.data);
                toast.success("Invite sent successfully");
                handleCloseAddMember();
            } else {
                
                console.log("Unable to send invite", response.data);
                console.error('Error details:', response.data.errors); 
                const errorMessage = response.data.errors.msg || "Unable to send invite";
                toast.error(errorMessage);
            }

        } catch (error) {
            console.error(error);
        }
    }


    return (
        <div className="container-fluid   bodyColor">

            <div className="row">
                <div className="col">
                    <Sidebar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                    <SidebarSmallDevice />
                </div>

                <div className={`${mainContainerClass}  main mt-md-3 `}>


                    <div className="member-dashbord">

                        <div className="">
                            <button className="btn  prev-button" onClick={handleClose}><img src={arrow} alt="prevus" /></button>

                        </div>

                        <div className="row">

                            <div className="col-md-4">

                                <div className="member-profile rounded-4 p-4 my-4">
                                    <div className="card text-center">
                                        <img src={member.image} alt="member profile" className="mx-auto card-pick"

                                            style={{ height: "150px", width: "150px", borderRadius: "50%" }}
                                        />

                                        <div className="card-body text-center">

                                            <h5>{member.fullName}</h5>
                                            <p>{member.email}</p>
                                            <p className="mt-2">{member.mobile}</p>
                                        </div>

                                    </div>

                                    <hr style={{ borderTop: '2px solid #6972B4', margin: 0 }} />

                                    <div className="pt-2">
                                        <h4 className="text-white">My Sports</h4>

                                        <div className="row">
                                            {member.teamSport.map((sport, index) => (
                                                <div key={index} className="d-flex ms-2 my-1 mt-3 align-items-center member-sports col-md-6">
                                                    <div className="d-flex align-items-center justify-content-center">
                                                        <img src={sport.selected_image} alt="sporticon" />
                                                        <p className="sport-text text-dark ms-3">{sport.sports_name.slice(0, 10)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>


                                    </div>
                                </div>

                            </div>


                            <div className="col-md-8">

                                <div className="dashbord-container itemsColor rounded-4 p-3 mt-4">
                                    <div className=" d-flex justify-content-between" >
                                        <h4>{member.fullName}'s Team</h4>
                                        <button className="btn btn-danger" onClick={handleShowAddMember}>Add</button>
                                    </div>


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
                                    ) : teams.length === 0 ? (
                                        <div className="row justify-content-center align-items-center p-5">
                                            <div className="col-12 text-center">
                                                <img src={team} alt="team pick" className="img-fluid mb-3" />
                                                <p className="mb-0">You have no team here.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="row justify-content-start align-items-center">
                                            {teams.map((team, index) => (
                                                <div key={index} className="col-12 col-md-6 mb-3 mt-2">
                                                    <div
                                                        className="d-flex align-items-center teams-container p-3"
                                                        style={{
                                                            backgroundColor: team.colour.colour,
                                                            borderColor: team.colour.border_colour,
                                                        }}
                                                    >
                                                        <img
                                                            src={team.logo}
                                                            className="card-img-top main-pick"
                                                            alt="Team"
                                                            style={{
                                                                width: "88px",
                                                                height: "88px",
                                                                borderRadius: "8px",
                                                            }}
                                                        />

                                                        <div className="ms-3">
                                                            <div className="teamName mb-3">
                                                                <h5 className="card-title">{team.teamName}</h5>
                                                            </div>

                                                            {team.sport && (
                                                                <div className="d-flex justify-content-center sportIcon px-2">
                                                                    <div className="mx-2 d-flex align-items-center">
                                                                        <img
                                                                            src={team.sport.selected_image}
                                                                            alt="sporticon"
                                                                            style={{ width: "25px", height: "25px" }}
                                                                        />
                                                                    </div>
                                                                    <div className="mx-2">
                                                                        <p className="sport-text">
                                                                            {/* slice text in small screens */}
                                                                            {window.innerWidth <= 1284
                                                                                ? team.sport.sports_name.slice(0, 7) + ".."
                                                                                : team.sport.sports_name}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}





                                </div>
                            </div>
                        </div>

                        <Offcanvas show={showAddMember} onHide={handleCloseAddMember} placement="end">
                            <Offcanvas.Header closeButton>
                                <Offcanvas.Title>
                                    {user.fullName} Team's
                                </Offcanvas.Title>
                            </Offcanvas.Header>

                            <Offcanvas.Body>
                                <div className="select team position-relative d-flex flex-column" style={{ minHeight: "calc(100vh - 70px)" }}>
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
                                    ) : allTeams.length === 0 ? (
                                        <div className="row justify-content-center align-items-center flex-grow-1 p-5">
                                            <div className="col-12 text-center">
                                                <img src={team} alt="team pick" className="img-fluid mb-3" />
                                                <p className="mb-0">You have no team here.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="row justify-content-center align-items-center flex-grow-1 overflow-auto">
                                            <ToastContainer />
                                            {allTeams.map((team, index) => (
                                                <div key={index} className="col-12 mt-2 mb-3 rounded-4 teamList">
                                                    <label
                                                        className="d-flex align-items-center teams-container px-3 py-2"
                                                        style={{
                                                            backgroundColor: team.colour.colour,
                                                            borderColor: team.colour.border_colour,
                                                            cursor: "pointer",
                                                        }}
                                                        htmlFor={`team-${index}`}
                                                    >
                                                        <input
                                                            className="form-check-input visually-hidden"
                                                            type="radio"
                                                            name="teamSelect"
                                                            id={`team-${index}`}
                                                            value={team._id}
                                                            onChange={() => handleTeamSelecte(team._id)}
                                                        />
                                                        <img
                                                            src={team.logo}
                                                            className="card-img-top main-pick"
                                                            alt="Team"
                                                            style={{
                                                                width: "88px",
                                                                height: "88px",
                                                                borderRadius: "8px",
                                                            }}
                                                        />

                                                        <div className="ms-3 flex-grow-1">
                                                            <div className="teamName mb-3">
                                                                <h5 className="card-title">{team.teamName}</h5>
                                                            </div>

                                                            {team.sport && (
                                                                <div className="d-flex justify-content-start sportIcon px-2" style={{ width: "70%" }}>
                                                                    <div className="mx-2 d-flex align-items-center">
                                                                        <img
                                                                            src={team.sport.selected_image}
                                                                            alt="sporticon"
                                                                            style={{ width: "20px", height: "20px" }}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <p className="sport-text">{team.sport.sports_name.slice(0, 12) + ".."}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="rounded-circle"
                                                            style={{
                                                                width: "20px",
                                                                height: "20px",
                                                                backgroundColor: selectedTeamId === team._id ? "green" : "white",
                                                            }}>

                                                        </div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    )}


                                </div>


                            </Offcanvas.Body>

                            <button className="btn btn-danger mt-auto" 
                            style={{ width: "21rem", alignSelf: "center", marginBottom: "1rem" }}
                            onClick={handleInvite}
                            >
                                Send Invite
                            </button>

                        </Offcanvas>


                    </div>

                </div>
            </div>
        </div>
    )
}

export default MemberDashBord; 