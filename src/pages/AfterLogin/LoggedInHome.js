import React, { useEffect } from "react";
import sport from "../../assets/afterLogin picks/home/2.png";
import team from "../../assets/afterLogin picks/home/team.png";
import event from "../../assets/afterLogin picks/home/event.png";
import coaching from "../../assets/afterLogin picks/home/coach.png";
import "../../assets/Styles/colors.css";
import "../../assets/Styles/AfterLogin/loggedInHome.css"
import { useState } from "react";
import { Link } from "react-router-dom";
import home from "../../assets/afterLogin picks/home/home.png";
import event2 from "../../assets/afterLogin picks/home/event2.png";
import team2 from "../../assets/afterLogin picks/home/team2.png";
import payment from "../../assets/afterLogin picks/home/payment.png";
import fav from "../../assets/afterLogin picks/home/fav.png";
import help from "../../assets/afterLogin picks/home/Help.png";
import training from "../../assets/afterLogin picks/home/event2.png";
import Events from "../../components/AfterLogin/Events";
import ChatComponent from "../../components/AfterLogin/ChatComponent";
import SidebarComponent from "../../components/AfterLogin/Sidebar"




const LoggedInHome = () => {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    console.log('Sidebar state:', sidebarOpen); // Log the state to check if it's updating correctly
  }, [sidebarOpen]);

  return (
    <div className="LoggedInHome container-fluid bodyColor pb-5 ">
      <div className="row">

        <div className="col-md-2">
          <div className="sidebar-header">
            <div className="hamburger" onClick={toggleSidebar}>
              {sidebarOpen ? '✕' : '☰'}
            </div>
          </div>

          <div className={`sidebar ${sidebarOpen ? 'active' : 'inactive'}`}>

            <div className="sidebar-header2">
              <div className="hamburger-2" onClick={toggleSidebar}>
                {sidebarOpen ? '✕' : '☰'}

              </div>
            </div>

            <nav className={`sideBar-links ${sidebarOpen ? 'open' : 'closed'}`}>
              <Link to="/home" onClick={toggleSidebar}>
                <div className="innerLink">
                  <img src={home} alt="home" />
                  <span>Home</span>
                </div>
              </Link>
              <Link to="/schedule" onClick={toggleSidebar}>
                <div className="innerLink ">
                  <img src={event2} alt="schedule" />
                  <span >Schedule</span>
                </div>
              </Link>
              <Link to="/event" onClick={toggleSidebar}>
                <div className="innerLink">
                  <img src={team2} alt="event" />
                  <span>Event</span>
                </div>
              </Link>
              <Link to="/training" onClick={toggleSidebar}>
                <div className="innerLink">
                  <img src={training} alt="training" />
                  <span>Training</span>
                </div>
              </Link>
              <Link to="/fav" onClick={toggleSidebar}>
                <div className="innerLink">
                  <img src={fav} alt="fav" />
                  <span>Favourite</span>
                </div>
              </Link>
              <Link to="/help" onClick={toggleSidebar}>
                <div className="innerLink">
                  <img src={help} alt="help" />
                  <span>Help</span>
                </div>
              </Link>
              <Link to="/payment" onClick={toggleSidebar}>
                <div className="innerLink">
                  <img src={payment} alt="payment" />
                  <span>Payment</span>
                </div>
              </Link>
            </nav>
          </div>

<SidebarComponent sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        </div>

        <div className="col-md-7 main    mt-5">

          <div className="row">
            <div className="col-md-6">
              <div className="row">
                <div className="col-6">
                  <div className="itemsColor  options d-flex flex-column align-items-center justify-content-center">
                    <img src={sport} alt="sport" />
                    <p>My Sports</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="itemsColor options d-flex flex-column align-items-center justify-content-center">
                    <img src={team} alt="team" />
                    <p>Create Team</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="row">
                <div className="col-6">
                  <div className="itemsColor options d-flex flex-column align-items-center justify-content-center">
                    <img src={event} alt="create event" />
                    <p>Create event</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="itemsColor options d-flex flex-column align-items-center justify-content-center">
                    <img src={coaching} alt="coaching" />
                    <p>Coaching & Training</p>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div className="events">
            <Events />
          </div>

          <div className="traning-center">
            <div className="my-4 ">
              <h4>Nearby Coaching & training</h4>
            </div>

            <div className="map itemsColor  d-flex justify-content-center py-3 px-3 rounded-3">
              <iframe title="Map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.301530464472!2d77.3047599749552!3d28.59072968597876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5b4c445ec5f%3A0xc928103a82b32dd7!2shanuman%20mandir!5e0!3m2!1sen!2sin!4v1713027372209!5m2!1sen!2sin" width="100%" height="220" ></iframe>
            </div>
          </div>




        </div>

        <div className="col-md-3 p-0 messages">

          <ChatComponent />

        </div>
      </div>
    </div>
  );
};

export default LoggedInHome;
