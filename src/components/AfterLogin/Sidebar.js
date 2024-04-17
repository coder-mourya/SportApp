import React from 'react';
import { Sidebar, Menu, MenuItem   } from 'react-pro-sidebar';

import "../../assets/Styles/AfterLogin/sidbar.css"
import { Link } from 'react-router-dom'; 

// Import your image assets

import home from "../../assets/afterLogin picks/home/home.png";
import event2 from "../../assets/afterLogin picks/home/event2.png";
import team2 from "../../assets/afterLogin picks/home/team2.png";
import payment from "../../assets/afterLogin picks/home/payment.png";
import fav from "../../assets/afterLogin picks/home/fav.png";
import help from "../../assets/afterLogin picks/home/Help.png";
import training from "../../assets/afterLogin picks/home/event2.png";

const SidebarComponent = ({ sidebarOpen, toggleSidebar }) => {
    return (
      <Sidebar collapsed={!sidebarOpen} className='custom-sidebar'>
        <div className="sidebar-header">
          <div className="hamburger" onClick={toggleSidebar}>
            {sidebarOpen ? '✕' : '☰'}
          </div>
        </div>
        <Menu iconShape="square" className='custom-menu'>
  <MenuItem className='custom-menu-item'>
    <div className='innerLink'>
      <Link to="/home" onClick={toggleSidebar}>
        <img src={home} alt="home" />
        <span>Home</span>
      </Link>
    </div>
  </MenuItem>
  <MenuItem className='custom-menu-item'>
    <div className='innerLink'>
      <Link to="/schedule" onClick={toggleSidebar}>
        <img src={event2} alt="schedule" />
        <span>Schedule</span>
      </Link>
    </div>
  </MenuItem>
  <MenuItem className='custom-menu-item'>
    <div className='innerLink'>
      <Link to="/event" onClick={toggleSidebar}>
        <img src={team2} alt="event" />
        <span>Event</span>
      </Link>
    </div>
  </MenuItem>
  <MenuItem className='custom-menu-item'>
    <div className='innerLink'>
      <Link to="/training" onClick={toggleSidebar}>
        <img src={training} alt="training" />
        <span>Training</span>
      </Link>
    </div>
  </MenuItem>
  <MenuItem className='custom-menu-item'>
    <div className='innerLink'>
      <Link to="/fav" onClick={toggleSidebar}>
        <img src={fav} alt="fav" />
        <span>Favourite</span>
      </Link>
    </div>
  </MenuItem>
  <MenuItem className='custom-menu-item'>
    <div className='innerLink'>
      <Link to="/help" onClick={toggleSidebar}>
        <img src={help} alt="help" />
        <span>Help</span>
      </Link>
    </div>
  </MenuItem>
  <MenuItem className='custom-menu-item'>
    <div className='innerLink'>
      <Link to="/payment" onClick={toggleSidebar}>
        <img src={payment} alt="payment" />
        <span>Payment</span>
      </Link>
    </div>
  </MenuItem>
</Menu>

      </Sidebar>
    );
  };
  
  export default SidebarComponent;
  