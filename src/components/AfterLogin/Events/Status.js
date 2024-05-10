import React, { useState } from 'react';
import YesComponent from './YesComponent';
import NoComponent from './NoComponent';
import PendingComponent from './PendingComponent';

const Status = () => {
  const [activeButton, setActiveButton] = useState('Yes');

  const handleButtonClick = (button) => {
    setActiveButton(button);
  };

  const renderComponent = () => {
    switch (activeButton) {
      case 'Yes':
        return <YesComponent />;
      case 'No':
        return <NoComponent />;
      case 'Pending':
        return <PendingComponent />;
      default:
        return <YesComponent />;
    }
  };

  return (
    <div className="container">
      <div className="row mt-5">
        <div className="col-md-12 d-flex justify-content-around status-btn">
          {/* Buttons for the new component */}
          <button
            className={`btn btn-${activeButton === 'Yes' ? 'Active' : ''} mr-2`}
            onClick={() => handleButtonClick('Yes')}
          >
            Yes (07)
          </button>
          <button
            className={`btn btn-${activeButton === 'No' ? 'Active' : ''} mr-2`}
            onClick={() => handleButtonClick('No')}
          >
            No (02)
          </button>
          <button
            className={`btn btn-${activeButton === 'Pending' ? 'Active' : ''}`}
            onClick={() => handleButtonClick('Pending')}
          >
            Pending (5)
          </button>
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-md-12">
          {/* Render the component based on activeButton state */}
          {renderComponent()}
        </div>
      </div>
    </div>
  );
};

export default Status;
