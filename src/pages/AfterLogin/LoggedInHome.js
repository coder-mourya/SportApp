import React from "react";
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

// import GoogleMapComponent from "../../components/AfterLogin/LocationMap";


const LoggedInHome = () => {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="LoggedInHome container-fluid bodyColor">
      <div className="row">
        <div className={`col-md-2 sidebar ${sidebarOpen ? "active" : "inactive"}`}>
          {/* Toggler button */}
          <div className="hamburger" onClick={toggleSidebar}>
            &#9776;
          </div>

          {/* Links */}
          <div className={`links itemsColor   ${sidebarOpen ? "active" : "inactive"}`}>
            <Link to={"/home"} onClick={toggleSidebar}>
              {sidebarOpen ? (
                <div className="link">
                  <img src={home} alt="home" />
                  <span>Home</span>
                </div>
              ) : null}
            </Link>

            <Link to={"/schedule"} onClick={toggleSidebar}>
              {sidebarOpen ? (
                <div className="link">
                  <img src={event2} alt="schedule" />
                  <span>Schedule</span>
                </div>
              ) : null}
            </Link>

            <Link to={"/event"} onClick={toggleSidebar}>
              {sidebarOpen ? (
                <div className="link">
                  <img src={team2} alt="event" />
                  <span>Event</span>
                </div>
              ) : null}
            </Link>

            <Link to={"/training"} onClick={toggleSidebar}>
              {sidebarOpen ? (
                <div className="link">
                  <img src={training} alt="training" />
                  <span>Training</span>
                </div>
              ) : null}
            </Link>

            <Link to={"/fav"} onClick={toggleSidebar}>
              {sidebarOpen ? (
                <div className="link">
                  <img src={fav} alt="fav" />
                  <span>Favourite</span>
                </div>
              ) : null}
            </Link>

            <Link to={"/help"} onClick={toggleSidebar}>
              {sidebarOpen ? (
                <div className="link">
                  <img src={help} alt="help" />
                  <span>Help</span>
                </div>
              ) : null}
            </Link>

            <Link to={"/payment"} onClick={toggleSidebar}>
              {sidebarOpen ? (
                <div className="link">
                  <img src={payment} alt="payment" />
                  <span>Payment</span>
                </div>
              ) : null}
            </Link>
          </div>


        </div>

        <div className="col-md-8 main   mt-5">
          <div className="row">

                
          <div className="col">
            <div className="itemsColor options d-flex flex-column align-items-center justify-content-center">
              <img src={sport} alt="sport" />
              <p>My Sports</p>
            </div>
          </div>
          <div className="col">
            <div className="itemsColor options d-flex flex-column align-items-center justify-content-center">
              <img src={team} alt="team" />
              <p>Create Team</p>
            </div>
          </div>
          <div className="col">
            <div className="itemsColor options d-flex flex-column align-items-center justify-content-center">
              <img src={event} alt="create event" />
              <p>Create event</p>
            </div>
          </div>
          <div className="col">
            <div className="itemsColor options d-flex flex-column align-items-center justify-content-center">
              <img src={coaching} alt="coaching" />
              <p>Coaching & Training</p>
            </div>
          </div>
          </div>

          <div className="events">
              <Events />
          </div>

          <div className="traning-center">
                <div className="my-4">
                  <h4>Nearby Coaching & training</h4>
                </div>

                  <div className="map itemsColor  d-flex justify-content-center py-2 rounded-3">
                  <iframe  title="Map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.301530464472!2d77.3047599749552!3d28.59072968597876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5b4c445ec5f%3A0xc928103a82b32dd7!2shanuman%20mandir!5e0!3m2!1sen!2sin!4v1713027372209!5m2!1sen!2sin" width="700" height="200" ></iframe>
                  </div>
          </div>



         
        </div>

        <div className="col-md-2 messages"></div>
      </div>
    </div>
  );
};

export default LoggedInHome;
