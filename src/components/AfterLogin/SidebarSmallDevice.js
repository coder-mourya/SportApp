import {React , useState, useEffect} from "react";
import { Link } from "react-router-dom";
import "../../assets/Styles/AfterLogin/sidbar.css";
import home from "../../assets/afterLogin picks/home/home.png";
import event2 from "../../assets/afterLogin picks/home/event2.png";
import team2 from "../../assets/afterLogin picks/home/team2.png";
import payment from "../../assets/afterLogin picks/home/payment.png";
import fav from "../../assets/afterLogin picks/home/fav.png";
import help from "../../assets/afterLogin picks/home/Help.png";
import training from "../../assets/afterLogin picks/home/event2.png";


const SidebarSmall = () => {

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
      setSidebarOpen(!sidebarOpen);
    };
  
    useEffect(() => {
    //   console.log('Sidebar state:', sidebarOpen); 
    }, [sidebarOpen]);



    return (

        
       <>
            {/* <div className="sidebar-header">
                <div className="hamburger" onClick={toggleSidebar}>
                    {sidebarOpen ? '✕' : '☰'}
                </div>
            </div> */}

            <div className={`sidebar ${sidebarOpen ? 'active' : 'inactive'}`}>

                <div className="sidebar-header2">
                    <div className="hamburger-2" onClick={toggleSidebar}>
                        {sidebarOpen ? '✕' : '☰'}

                    </div>
                </div>

                <nav className={`sideBar-links ${sidebarOpen ? 'open' : 'closed'}`}>
                    <Link to="/LoggedInHome" onClick={toggleSidebar}>
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
       
       </>

    )
}

export default SidebarSmall;