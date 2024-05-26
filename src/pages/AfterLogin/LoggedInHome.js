import React, { useEffect } from "react";
import team from "../../assets/afterLogin picks/home/team.png";
import event from "../../assets/afterLogin picks/home/event.png";
import coaching from "../../assets/afterLogin picks/home/coach.png";
import "../../assets/Styles/colors.css";
import "../../assets/Styles/AfterLogin/loggedInHome.css"
import Events from "../../components/AfterLogin/Events";
import YoutubeVideo from "../../components/AfterLogin/YoutubeVideo";
import SidebarComponent from "../../components/AfterLogin/Sidebar";
import SidebarSmall from "../../components/AfterLogin/SidebarSmallDevice";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { BaseUrl } from "../../reducers/Api/bassUrl";
import axios from "axios";




const LoggedInHome = () => {


  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mainContainerClass, setMainContainerClass] = useState('col-md-8');
  const [count, setCount] = useState(0);
  const token = useSelector((state) => state.auth.user.data.user.token);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    setMainContainerClass(sidebarOpen ? 'col-md-8 ' : 'col-md-7 ');
  };


  const Navigate = useNavigate();
  const handleTeamClick = () => {
    Navigate("/CreateTeam");
  }

  const handleMySports = () => {
    Navigate("/Category");
  }




  useEffect(() => {
    const getSportCount = async () => {
      const sportCountUrl = BaseUrl();

      try {
        const response = await axios.get(`${sportCountUrl}/api/v1/user/sports/count`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        setCount(response.data.data.sports_count);        
        console.log("sports count:" , response.data.data.sports_count); 
      } catch (error) {
        console.error('Error fetching sports data:', error);
      }
    }

    getSportCount()
  }, [token])


  return (
    <div className="LoggedInHome container-fluid bodyColor pb-5 ">

      <div className="row">

        <div className="col">


          <SidebarSmall />
          <SidebarComponent toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

        </div>

        <div className={`${mainContainerClass} main mt-5`}>

          <div className="row">
            <div className="col-md-6">
              <div className="row option-container">
                <div className="col-6">
                  <div className="itemsColor  option d-flex flex-column align-items-center justify-content-center" onClick={handleMySports}>
                    <h1 className="sportCount">{count}</h1>
                    <p>My Sports</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="itemsColor option custum-style d-flex flex-column align-items-center justify-content-center" onClick={handleTeamClick}>
                    <img src={team} alt="team" />
                    <p>Create Team</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="row">
                <div className="col-6">
                  <div className="itemsColor option custum-style d-flex flex-column align-items-center justify-content-center">
                    <img src={event} alt="create event" />
                    <p>Create event</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="itemsColor option custum-style d-flex flex-column align-items-center justify-content-center">
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

          <YoutubeVideo />

        </div>
      </div>
    </div>
  );
};

export default LoggedInHome;
