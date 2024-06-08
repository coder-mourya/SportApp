import React, { useEffect } from "react";
import Member from "../../../assets/afterLogin picks/My team/Member.svg";
// import { members } from "../../../assets/DummyData/TeamData";
import "../../../assets/Styles/AfterLogin/Addmember.css";
import { BaseUrl } from "../../../reducers/Api/bassUrl";
import { useSelector } from "react-redux";
import axios from "axios";
import { useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";


const AllMembers = () => {
    const token = useSelector(state => state.auth.user.data.user.token);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const Navigate = useNavigate();


    useEffect(() => {


        // Fetch members data
        const GetMembers = async () => {
            const MemberUrl = BaseUrl();

            try {
                const response = await axios.get(`${MemberUrl}/api/v1/user/get-all-members`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                console.log("members list", response.data.data.membersData.memberList);
                const membersData = response.data.data.membersData.memberList;
                setMembers(membersData);
            } catch (error) {
                console.error("internal server error", error)

            } finally {
                setLoading(false)
            }
        }

        GetMembers();

    }, [token])


    const handleMemberDetails  = (member) =>{
        Navigate("/MemberDashBord", {state: {member}})
    }


    return (
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
                    <div className="row d-flex justify-content-start">
                        {members.map((member, index) => (
                            <div key={index} className="col-md-4 p-4 row">
                                <div className="bodyColor d-flex align-items-center p-4 rounded-4 All-members-container"
                                 onClick={() => handleMemberDetails(member)}
                                  style={{
                                    cursor: "pointer",}}
                                 >
                                    <div className="members-pick col-md-3">
                                        <img src={member.image} alt="Member" style={{width: "88px", height: "88px", objectFit: "cover"}}/>
                                    </div>
                                    <div className="col-md-9">
                                        <div className="ms-3">
                                            <p style={{fontSize: "20px",fontWeight: "500"}}>{member.fullName}</p>
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
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )

            }

        </div>
    );
};

export default AllMembers;