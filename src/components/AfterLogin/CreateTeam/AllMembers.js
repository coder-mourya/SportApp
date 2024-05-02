import React from "react";
import Member from "../../../assets/afterLogin picks/My team/Member.svg";
import { members } from "../../../assets/DummyData/TeamData";
import "../../../assets/Styles/AfterLogin/Addmember.css";

const AllMembers = () => {
    // Check if there are any members
    const hasMembers = members.length > 0;

    return (
        <div className="container-fluid itemsColor rounded">
            {/* Conditional rendering based on whether there are members or not */}
            {hasMembers ? (
                // Render members data
                <div className="row d-flex justify-content-center">
                    {members.map((member, index) => (
                        <div key={index} className="col-md-4 p-4 row">
                            <div className="bodyColor d-flex align-items-center p-3 rounded All-members-container">
                                <div className="members-pick col-md-3">
                                    <img src={member.membersImage} alt="Member" />
                                </div>
                                <div className="col-md-9">
                                    <div className="ms-3">
                                        <p>{member.memberName}</p>
                                        <div className="d-flex flex-wrap sports-list-picks">
                                            {Object.keys(member).map((key, index) => {
                                                // Check if the key starts with "memberSport" to identify sports
                                                if (key.startsWith("memberSport")) {
                                                    return (
                                                        <div key={index} className="mb-2 d-flex align-items-center justify-content-center">
                                                            <img src={member[key]} alt={`Sport ${index + 1}`} className="rounded-circle" />
                                                        </div>
                                                    );
                                                }
                                                return null; // Skip other keys
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Render "no member" message
                <div className="row justify-content-center align-items-center p-5">
                    <div className="col-12 d-flex justify-content-center align-items-center mb-3">
                        <img src={Member} alt="member pick" className="img-fluid" />
                    </div>
                    <div className="col-12 text-center">
                        <p className="mb-0">You have no member here.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllMembers;
