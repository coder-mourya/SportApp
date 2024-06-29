import React, { useState } from "react";
import Sidebar from "../../components/AfterLogin/Sidebar";
import SidebarSmallDevice from "../../components/AfterLogin/SidebarSmallDevice";
import MyTeam from "../../components/AfterLogin/CreateTeam/MyTeam";
import AllMembers from "../../components/AfterLogin/CreateTeam/AllMembers";
import MyFamily from "../../components/AfterLogin/CreateTeam/MyFamily";
import "../../assets/Styles/colors.css";
import "../../assets/Styles/AfterLogin/createTeam.css";
import search from "../../assets/afterLogin picks/My team/search.svg";
import Offcanvas from 'react-bootstrap/Offcanvas';
import AddMember from "../../components/AfterLogin/CreateTeam/AddMember";
import AddFamilyMember from "../../components/AfterLogin/CreateTeam/AddFamilyMember";
import Create from "../../components/AfterLogin/CreateTeam/Create";



const CreateTeam = () => {
  const [selectedOption, setSelectedOption] = useState("myTeam");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mainContainerClass, setMainContainerClass] = useState('col-md-11');

  const [additionalButtonVisible, setAdditionalButtonVisible] = useState(false); // buttons selections 


  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddFamilyMember, setShowAddFamilyMember] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);

  // for add member
  const handleShowAddMember = () => setShowAddMember(true);
  const handleCloseAddMember = () => setShowAddMember(false);

  // functions for add family member 
  const handleShowAddFamilyMember = () => setShowAddFamilyMember(true);
  const handleCloseAddFamilyMember = () => setShowAddFamilyMember(false);
  // offcanvas for create team
  const handleShowCreateTeam = () => setShowCreateTeam(true);
  const handleCloseCreateTeam = () => setShowCreateTeam(false);

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






  const renderAdditionalButton = () => {
    if (selectedOption === "myFamily") {
      return (
        <button className="btn btn-danger mx-2" onClick={handleShowAddFamilyMember}>
          Add Member
        </button>
      );
    } else if (additionalButtonVisible) {
      return (
        <button className="btn btn-danger mx-2" onClick={handleShowAddMember}>
          Add Member
        </button>
      );
    } else {
      return (
        <>
          <button className="btn ">
            <img src={search} alt="search icons" />
          </button>
          <button
            className="btn border-danger btn-danger"
            onClick={handleShowCreateTeam}
          >
            Create team
          </button>
        </>
      );
    }
  };





  return (
    <div className="container-fluid create-team  bodyColor ">
      <div className="row">
        <div className="col">
          <Sidebar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
          <SidebarSmallDevice />
        </div>
        <div className={`${mainContainerClass}  main mt-2`}>


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

          {/* offcanvas for member */}
          <Offcanvas show={showAddMember} onHide={handleCloseAddMember} placement="end" >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Add Member</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <AddMember  handleCloseAddMember={handleCloseAddMember}/>
            </Offcanvas.Body>
          </Offcanvas>
          {/* offcanvas for family */}
          <Offcanvas show={showAddFamilyMember} onHide={handleCloseAddFamilyMember} placement="end" >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Add Family Member</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <AddFamilyMember />
            </Offcanvas.Body>
          </Offcanvas>


          {/* offcanvas for create team */}

          <Offcanvas show={showCreateTeam} onHide={handleCloseCreateTeam} placement="end" className="create-team-offcanvas" >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>
                <h2>Create Team</h2>
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Create  handleCloseCreateTeam={handleCloseCreateTeam}  />
            </Offcanvas.Body>
          </Offcanvas>
        </div>
      </div>
    </div>
  );
};

export default CreateTeam;
