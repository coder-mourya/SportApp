import React, { useEffect } from "react";
// import cros from "../../../assets/afterLogin picks/My team/Cross.svg";
import "../../../assets/Styles/AfterLogin/Addmember.css";
import { useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import team from "../../../assets/afterLogin picks/My team/team.svg";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { fetchTeams } from "../../../reducers/teamSlice";
import { toast } from "react-toastify";
import { fetchEventsDetails } from "../../../reducers/eventSlice";

import { fetchMembers } from "../../../reducers/memberSlice";
import logo from "../../../assets/img/logo.png";
import Member from "../../../assets/afterLogin picks/My team/Member.svg";
import axios from "axios";
import { BaseUrl } from "../../../reducers/Api/bassUrl";




// Modified version of MyTeam component
const ModifiedMyTeam = ({ EventDetails, handleCLoseAddEventMember }) => {
    const [loading, setLoading] = useState(true);
    const [selectedTeamId, setSelectedTeamId] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const dispatch = useDispatch();
    const token = useSelector(state => state.auth.user.data.user.token);
    const allTeams = useSelector(state => state.teams.teams);
    // console.log("event details in add member ", EventDetails);
    const eventId = EventDetails._id;
    const createrId = EventDetails.creatorId;
    // console.log("creator id ", createrId);
    //    console.log("allTeams", allTeams);

    useEffect(() => {
        dispatch(fetchTeams(token))
            .then(() => setLoading(false))
    }, [token, dispatch])


    const handleTeamSelecte = (team, createrId) => {
        // console.log("Selected team:", team);
        const teamId = team._id;
        setSelectedTeamId(prevSelectedTeamId =>
            prevSelectedTeamId.includes(teamId)
                ? prevSelectedTeamId.filter(id => id !== teamId)
                : [...prevSelectedTeamId, teamId]
        );

        // console.log("Team members:", team.members);

        if (team.members && Array.isArray(team.members) && team.members.length > 0) {
            const memberIds = team.members.map(member => member._id || member);

            // Always include the creator
            const membersWithCreator = new Set([...memberIds, createrId]);

            setTeamMembers(prevTeamMembers => ({
                ...prevTeamMembers,
                [teamId]: [...membersWithCreator]
            }));
        } else {
            // If the team has no members, remove it from teamMembers
            setTeamMembers(prevTeamMembers => ({
                ...prevTeamMembers,
                [teamId]: [createrId]
            }));
        }
    }

    // Add members from team to event
    const handleAddMemberTeam = async () => {
        setLoading(true);
      try {
        const url = BaseUrl();
        const allMemberIds = selectedTeamId.flatMap(teamId => teamMembers[teamId] || []);
        // remove duplicates  
        const uniqueMemberIds = [...new Set(allMemberIds)];
        let data = {
            "eventId": eventId,
            "memberId": uniqueMemberIds
        }
        console.log("check data", data);
        // return;
        
        const response = await axios.post(`${url}/user/event/add/member`, data, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (response.data.status === 200) {
            
            toast.success("Member added successfully");
            dispatch(fetchEventsDetails({ eventId, token }));
            // console.log("response", response.data);
            handleCLoseAddEventMember();
        }else{
            toast.error("error in adding member");
        }
      } catch (error) {
        console.error('Error adding member:', error);
        toast.error("internal server error");
      }finally{
        setLoading(false);
      }

    }


    return (
        <div className="ModifiedMyTeam">
            <div className="select team position-relative d-flex flex-column">
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
                    <div className="row justify-content-center  flex-grow-5 overflow-auto">

                        {allTeams.map((team, index) => (
                            <div key={index} className=" mt-2 mb-3 rounded-4   teamList">
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
                                        onChange={() => handleTeamSelecte(team, createrId)}
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
                                                    <p className="sport-text">{team.sport.sports_name.slice(0, 10) + ".."}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="rounded col-md-2"
                                        style={{
                                            width: "22px",
                                            height: "22px",
                                            border: "1px solid #ccc",
                                            backgroundColor: selectedTeamId.includes(team._id) ? "green" : "white",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",

                                        }}>

                                        {selectedTeamId.includes(team._id) && <span style={{ color: "white", fontWeight: "400" }}>&#x2713;</span>}
                                    </div>
                                </label>
                            </div>
                        ))}
                    </div>
                )}

                <div className="d-flex justify-content-end fixed-bottom">
                    <button
                        className="btn"
                        onClick={handleAddMemberTeam}
                        style={{
                            width: "25%", backgroundColor: "#D32F2F", color: "white", border: "none",
                            marginBottom: "2px",
                            // marginRight: "5px",
                        }}
                    >Add team</button>
                </div>
            </div>
        </div>
    );
};




// Modified version of AllMembers component
const ModifiedAllMembers = ({EventDetails, handleCLoseAddEventMember}) => {

    const token = useSelector(state => state.auth.user.data.user.token);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch()
    const members = useSelector(state => state.members.members)
    const [selectedMemberId, setSelectedMemberId] = useState([]);
    const eventId = EventDetails._id;
    // console.log("all selected members list ", selectedMemberId);

    // console.log("members", members);

    useEffect(() => {
        dispatch(fetchMembers(token))
            .then(() => setLoading(false))
    }, [token, dispatch])

    const handleSelectMemberId = (memberID) => {
        // console.log("selected member id", memberID);
        setSelectedMemberId(prevSelectedMemberId =>
            prevSelectedMemberId.includes(memberID)
                ? prevSelectedMemberId.filter(id => id !== memberID)
                : [...prevSelectedMemberId, memberID]

        )
    }

    const handleAddMember = async () => {
        setLoading(true);
        try {
            const url = BaseUrl();
           
            let data = {
                "eventId": eventId,
                "memberId": selectedMemberId
            }
            // console.log("check data", data);
            // setLoading(false)
            // return;
            
            
            const response = await axios.post(`${url}/user/event/add/member`, data, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
    
            if (response.data.status === 200) {
                toast.success("Member added successfully");
                // console.log("check response", response.data);                
                dispatch(fetchEventsDetails({ eventId, token }));
                handleCLoseAddEventMember();
                
            }else{
                toast.error("error in adding member");
            }
          } catch (error) {
            // console.error('Error adding member:', error);
            toast.error("internal server error");
          }finally{
            setLoading(false);
          }
    }


    return (
        <div className="ModifiedAllMembers">
            <div className="container-fluid itemsColor rounded-4 dashbords-container-hieght mb-2">
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
                    members.length === 0 ? (
                        <div className="row justify-content-center align-items-center p-5">
                            <div className="col-12 d-flex justify-content-center align-items-center mb-3">
                                <img src={Member} alt="member pick" className="img-fluid" />
                            </div>
                            <div className="col-12 text-center">
                                <p className="mb-0">You have no member here.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="row d-flex justify-content-center">
                            {members.map((member, index) => (
                                <div key={index} className="col-md-4 my-2 row">
                                    <div className="bodyColor d-flex align-items-center p-2 rounded-4 All-members-container"

                                        style={{
                                            cursor: "pointer",

                                        }}

                                        onClick={() => handleSelectMemberId(member._id)}
                                    >
                                        <div className="members-pick col-md-3">
                                            {member.image ? (

                                                <img src={member.image} alt="Member" style={{ width: "88px", height: "88px", objectFit: "cover" }} />
                                            ) : (

                                                <img src={logo} alt="Member" style={{ width: "88px", height: "88px", objectFit: "cover" }} />
                                            )}
                                        </div>
                                        <div className="col-md-8">
                                            <div className="ms-3">
                                                <p style={{ fontSize: "20px", fontWeight: "500" }}>{member.fullName}</p>
                                                <div className="d-flex flex-wrap sports-list-picks">
                                                    {member.teamSport.map((sport, sportIndex) => (
                                                        <div key={sportIndex} className="mb-2 d-flex align-items-center justify-content-center" style={{
                                                            backgroundColor: "white",
                                                            width: "32px",
                                                            height: "32px",
                                                            borderRadius: "50%",
                                                            padding: "5px",
                                                        }}>
                                                            <img
                                                                src={sport.selected_image}
                                                                alt={sport.sports_name}
                                                                className="img-fluid"
                                                                style={{ width: "20px", height: "20px", objectFit: "cover" }}
                                                            />
                                                        </div>
                                                    ))}


                                                </div>

                                            </div>
                                        </div>

                                        <div className="rounded col-md-2"
                                            style={{
                                                width: "22px",
                                                height: "22px",
                                                border: "1px solid #ccc",
                                                backgroundColor: selectedMemberId.includes(member._id) ? "green" : "white",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",

                                            }}>

                                            {selectedMemberId.includes(member._id) && <span style={{ color: "white", fontWeight: "400" }}>&#x2713;</span>}
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )

                }

                <div className="d-flex justify-content-end fixed-bottom">
                    <button
                        className="btn"
                        onClick={handleAddMember}
                        style={{ width: "25%", backgroundColor: "#D32F2F", color: "white", border: "none", marginRight: "7px", marginBottom: "2px" }}
                    >Add Member</button>
                </div>

            </div>
        </div>
    );
};

const AddEventMember = ({ EventDetails, handleCLoseAddEventMember }) => {
    const [selectedOption, setSelectedOption] = useState("MyTeam");


    // handle options selections
    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };





    return (
        <div className="Add-member-and-team">
            <div className="">
                <div className=" itemsColor py-2  rounded-4 team-and-member-btn  border d-flex   justify-content-center  ">
                    <button
                        className={`btn ${selectedOption === "MyTeam" ? "btn-primary" : ""}`}
                        onClick={() => handleOptionChange("MyTeam")}
                    >
                        Team
                    </button>
                    <button
                        className={`btn ${selectedOption === "AllMembers" ? "btn-primary" : ""}`}
                        onClick={() => handleOptionChange("AllMembers")}
                    >
                        AllMembers
                    </button>
                </div>

                <div className="">
                    {/* Render selected component */}
                    {selectedOption === "MyTeam" ? <ModifiedMyTeam EventDetails={EventDetails} handleCLoseAddEventMember={handleCLoseAddEventMember} /> : <ModifiedAllMembers EventDetails={EventDetails} handleCLoseAddEventMember={handleCLoseAddEventMember} />}
                </div>


            </div>
        </div>
    );
};

export default AddEventMember;