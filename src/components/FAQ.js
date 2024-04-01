import React, { useState } from "react";
import "./FAQ.css"; // Import custom CSS for styling

const FAQ = () => {
  // State to keep track of active accordion item
  const [activeItem, setActiveItem] = useState(null);

  // Function to toggle accordion item
  const toggleAccordion = (index) => {
    setActiveItem(activeItem === index ? null : index);
  };

  return (
    <div className="container">

      <div className="container text-center mt-5 FQA">
        <h1 >
          <b>Frequently asked</b> <strong>questions</strong>
        </h1>
        <p>Sed ut perspiciatis unde omins iste natus error sit voluptatem accusatium doloremque.</p>
      </div>

      <div className="container mt-5 d-flex justify-content-center">
        <div className="accordion">
          
          <div className="accordion-item">
            <button className="accordion-header" onClick={() => toggleAccordion(1)}>
              What is sportsnerve?
              {activeItem === 1 ?  <i class="fa-solid fa-minus accordion-icon"></i> : <i className="fa-solid fa-plus accordion-icon"></i>}
            </button>
            <div className={`accordion-content ${activeItem === 1 ? 'active' : ''}`}>
              Sportsnerve is a platform for sports enthusiasts to connect, share information, and participate in various activities related to sports.
            </div>
          </div>

          <div className="accordion-item">
            <button className="accordion-header" onClick={() => toggleAccordion(2)}>
              How can I join a team on sportsnerve?
              {activeItem === 2 ? <i className="fa-solid fa-minus accordion-icon"></i> : <i className="fa-solid fa-plus accordion-icon"></i>}
            </button>

            <div className={`accordion-content ${activeItem === 2 ? 'active' : ''}`}>
              To join a team on sportsnerve, you can browse through the available teams, select the one you're interested in, and follow the instructions provided by the team administrator to join.
            </div>
          </div>

          <div className="accordion-item">
            <button className="accordion-header" onClick={() => toggleAccordion(3)}>
            How shall I invite my team members to join team ?
              {activeItem === 3 ?  <i className="fa-solid fa-minus accordion-icon"></i> : <i className="fa-solid fa-plus accordion-icon"></i>}
            </button>
            
            <div className={`accordion-content ${activeItem === 3 ? 'active' : ''}`}>
              To join a team on sportsnerve, you can browse through the available teams, select the one you're interested in, and follow the instructions provided by the team administrator to join.
            </div>
          </div>


          <div className="accordion-item">
            <button className="accordion-header" onClick={() => toggleAccordion(4)}>
            How can I download details of my team ?
              {activeItem === 4 ?  <i className="fa-solid fa-minus accordion-icon"></i> : <i className="fa-solid fa-plus accordion-icon"></i>}
            </button>
            
            <div className={`accordion-content ${activeItem === 4 ? 'active' : ''}`}>
              To join a team on sportsnerve, you can browse through the available teams, select the one you're interested in, and follow the instructions provided by the team administrator to join.
            </div>
          </div>


          <div className="accordion-item">
            <button className="accordion-header" onClick={() => toggleAccordion(5)}>
            How many admins I will have in application ?
              {activeItem === 5 ?  <i className="fa-solid fa-minus accordion-icon"></i> : <i className="fa-solid fa-plus accordion-icon"></i>}
            </button>
            
            <div className={`accordion-content ${activeItem === 5 ? 'active' : ''}`}>
              To join a team on sportsnerve, you can browse through the available teams, select the one you're interested in, and follow the instructions provided by the team administrator to join.
            </div>
          </div>


          <div className="accordion-item">
            <button className="accordion-header" onClick={() => toggleAccordion(6)}>
            What are the recommendations for Team profile & cover image?
              {activeItem === 6 ?  <i className="fa-solid fa-minus accordion-icon"></i> : <i className="fa-solid fa-plus accordion-icon"></i>}
            </button>
            
            <div className={`accordion-content ${activeItem === 6 ? 'active' : ''}`}>
              To join a team on sportsnerve, you can browse through the available teams, select the one you're interested in, and follow the instructions provided by the team administrator to join.
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default FAQ;
