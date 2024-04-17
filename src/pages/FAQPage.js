import React, { useState } from "react";
import "../assets/Styles/about.css";
import "../assets/Styles/Allfonts.css";
import Contact from "../components/Contact";
import "../assets/Styles/FAQ.css";
import {createTeamAccordionItems} from "../assets/DummyData/All-FAQ";
import {createEventAccordionItems} from "../assets/DummyData/All-FAQ";
import {userTrainingAccordionItems} from "../assets/DummyData/All-FAQ";

const FAQPage = () => {
  const [activeItem, setActiveItem] = useState(null);
  const [selectedOption, setSelectedOption] = useState("createTeam");

  const handleClick = (option, index) => {
    setSelectedOption(option);
    setActiveItem(null); // Reset activeItem when a different button is clicked
  };

  const toggleAccordion = (index) => {
    setActiveItem(activeItem === index ? null : index);
  };

 

  return (
    <div className="About us container-fluid g-0">
      <div className="d-flex justify-content-center align-items-center about text-white backIcon">
        <h1 className="allFonts">Frequently Asked Questions</h1>
      </div>

      <div className="FAQ-options d-flex justify-content-center my-5">
        <button
          className={`btn border ${selectedOption === "createTeam" ? "btn-danger" : ""}`}
          onClick={() => handleClick("createTeam", 1)}
        >
          Create team
        </button>

        <button
          className={`btn border mx-4 ${selectedOption === "createEvent" ? "btn-danger" : ""}`}
          onClick={() => handleClick("createEvent", 2)}
        >
          Create event
        </button>

        <button
          className={`btn border ${selectedOption === "userTraining" ? "btn-danger" : ""}`}
          onClick={() => handleClick("userTraining", 3)}
        >
          User training
        </button>
      </div>

      <div className="container mt-5 d-flex justify-content-center">
  <div className="accordion">
    {/* Render accordion items based on the selected option */}
    {selectedOption === "createTeam" &&
      createTeamAccordionItems.map((item, index) => (
        <div className="accordion-item" key={index}>
          <button
            className="accordion-header cust-border"
            onClick={() => toggleAccordion(index)}
          >
            {item.header}
            {activeItem === index ? (
              <i className="fa-solid fa-minus accordion-icon"></i>
            ) : (
              <i className="fa-solid fa-plus accordion-icon"></i>
            )}
          </button>
          <div
            className={`accordion-content ${activeItem === index ? "active" : ""}`}
          >
            {item.content}
          </div>
        </div>
      ))}

    {selectedOption === "createEvent" &&
      createEventAccordionItems.map((item, index) => (
        <div className="accordion-item" key={index}>
          <button
            className="accordion-header  cust-border"
            onClick={() => toggleAccordion(index)}
          >
            {item.header}
            {activeItem === index ? (
              <i className="fa-solid fa-minus accordion-icon"></i>
            ) : (
              <i className="fa-solid fa-plus accordion-icon"></i>
            )}
          </button>
          <div
            className={`accordion-content ${activeItem === index ? "active" : ""}`}
          >
            {item.content}
          </div>
        </div>
      ))}

    {selectedOption === "userTraining" &&
      userTrainingAccordionItems.map((item, index) => (
        <div className="accordion-item" key={index}>
          <button
            className="accordion-header cust-border"
            onClick={() => toggleAccordion(index)}
          >
            {item.header}
            {activeItem === index ? (
              <i className="fa-solid fa-minus accordion-icon"></i>
            ) : (
              <i className="fa-solid fa-plus accordion-icon"></i>
            )}
          </button>
          <div
            className={`accordion-content ${activeItem === index ? "active" : ""}`}
          >
            {item.content}
          </div>
        </div>
      ))}
  </div>
</div>

      <Contact />
    </div>
  );
};

export default FAQPage;
