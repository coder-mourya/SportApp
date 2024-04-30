import React, { useState } from "react";
import Sidebar from "../../components/AfterLogin/Sidebar";
import SidebarSmallDevice from "../../components/AfterLogin/SidebarSmallDevice";
import MyTeam from "../../components/AfterLogin/CreateTeam/MyTeam";
import AllMembers from "../../components/AfterLogin/CreateTeam/AllMembers";
import MyFamily from "../../components/AfterLogin/CreateTeam/MyFamily";
import "../../assets/Styles/colors.css";
import "../../assets/Styles/AfterLogin/createTeam.css";
import search from "../../assets/afterLogin picks/My team/search.svg";
import { useNavigate } from "react-router-dom";


const CreateTeam = () => {
    const [selectedOption, setSelectedOption] = useState("myTeam");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mainContainerClass, setMainContainerClass] = useState('col-md-11');

    const [additionalButtonVisible, setAdditionalButtonVisible] = useState(false); // buttons selections 

    const Navigate = useNavigate();

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
        setMainContainerClass(sidebarOpen ? 'col-md-11 ' : 'col-md-10 ');
    };


    // handle options slections
    const handleOptionChange = (option) => {
        setSelectedOption(option);

        if (option !== "myTeam") {
            setAdditionalButtonVisible(true);
          } else {
            setAdditionalButtonVisible(false);
          }
    };

    const renderComponent = () => {
        switch (selectedOption) {
            case "allMembers":
                return <AllMembers />;
            case "myFamily":
                return <MyFamily />;
            default:
                return <MyTeam />;
        }
    };

    // handle create team navigation
    const handleCreate = (event) => {
        event.preventDefault();
        Navigate("/Create")
    }

    

    const renderAdditionalButton = () =>{
        if (additionalButtonVisible) {
            return (
              <button className="btn btn-danger mx-2" onClick={handleAddMember}>
                Add Member
              </button>
            );
          } else {
            return (
              <>
                <button className="btn ">
                  <img src={search} alt="search icons" />
                </button>
                <button className="btn border-danger">Join with code</button>
                <button
                  className="btn border-danger btn-danger"
                  onClick={handleCreate}
                >
                  Create team
                </button>
              </>
            );
          }
    }

    // add member navigate 

    const handleAddMember = () =>{
            Navigate("/AddMember")
    }




    return (
        <div className="container-fluid create-team  bodyColor ">
          <div className="row">
          <div className="col">
                <Sidebar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                <SidebarSmallDevice />
            </div>
            <div className={`${mainContainerClass}  main mt-5`}>


                <div className="upper-contant ">
                    <div className="row All-options my-4 d-flex justify-content-center  justify-content-md-start">
                        <div className="col-md-6 col-lg-6 Team-options itemsColor py-2 text-center rounded ">
                            <button
                                className={`btn ${selectedOption === "myTeam" ? "btn-primary" : ""}`}
                                onClick={() => handleOptionChange("myTeam")}
                            >
                                My Team
                            </button>
                            <button
                                className={`btn ${selectedOption === "allMembers" ? "btn-primary" : ""}`}
                                onClick={() => handleOptionChange("allMembers")}
                            >
                                All Members
                            </button>
                            <button
                                className={`btn ${selectedOption === "myFamily" ? "btn-primary" : ""}`}
                                onClick={() => handleOptionChange("myFamily")}
                            >
                                My Family
                            </button>
                        </div>
                        <div className="col-md-6 col-lg-6 create-options py-2 ">
                            <div className=" d-flex justify-content-md-end justify-content-center ">
                               
                                {renderAdditionalButton()}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container-fluid d-flex justify-content-center">{renderComponent()}</div>
            </div>
          </div>
        </div>
    );
};

export default CreateTeam;
