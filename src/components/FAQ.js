import React, { useState } from "react";
import "../assets/Styles/FAQ.css"; // Import custom CSS for styling
import "../assets/Styles/Allfonts.css";


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
        <h1 className="allFonts">
          <b>Frequently asked</b> <strong>questions</strong>
        </h1>
        <p className="allFonts-p">Sed ut perspiciatis unde omins iste natus error sit voluptatem accusatium doloremque.</p>
      </div>

      <div className="FAQ-options">
        
      </div>

      <div className="container mt-5 d-flex justify-content-center">
        <div className="accordion">
          
          <div className="accordion-item">
            <button className="accordion-header" onClick={() => toggleAccordion(1)}>
            How shall I invite my team members to join team ?
              {activeItem === 1 ?  <i class="fa-solid fa-minus accordion-icon"></i> : <i className="fa-solid fa-plus accordion-icon"></i>}
            </button>
            <div className={`accordion-content ${activeItem === 1 ? 'active' : ''}`}>
              
            Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast                        
            </div>
          </div>

          <div className="accordion-item">
            <button className="accordion-header cust-border" onClick={() => toggleAccordion(2)}>
            How can I donaload details of my team ? 
              {activeItem === 2 ? <i className="fa-solid fa-minus accordion-icon"></i> : <i className="fa-solid fa-plus accordion-icon"></i>}
            </button>

            <div className={`accordion-content ${activeItem === 2 ? 'active' : ''}`}>
            Once you click on the team you will see a list of all team members. On the top side corner of a list you will find a donwload button which will download details of your team in excel file.
            </div>
          </div>

          <div className="accordion-item">
            <button className="accordion-header cust-border" onClick={() => toggleAccordion(3)}>
            How many admins I will have in application ?
              {activeItem === 3 ?  <i className="fa-solid fa-minus accordion-icon"></i> : <i className="fa-solid fa-plus accordion-icon"></i>}
            </button>
            
            <div className={`accordion-content ${activeItem === 3 ? 'active' : ''}`}>
            You can mark admins for individual teams and for indidual events.The team admins cannot be necessary admins for team events.
            </div>
          </div>



          
        </div>
      </div>
    </div>
  );
};

export default FAQ;
