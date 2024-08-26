import React, { useEffect, useState } from 'react';
import YesComponent from './YesComponent';
import NoComponent from './NoComponent';
import PendingComponent from './PendingComponent';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { fetchEventsDetails } from '../../../reducers/eventSlice';


const Status = ({ eventId }) => {
  const [activeButton, setActiveButton] = useState('Yes');
  const EventDetails = useSelector((state) => state.events.eventDetails);
  const token = useSelector((state) => state.auth.user.data.user.token);
  const dispatch = useDispatch();
  // console.log("event details id in status", EventDetails);
  const [yesCount, setYesCount] = useState(0);
  const [noCount, setNoCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  // console.log("yes", yesCount, "no", noCount, "pending", pendingCount);

  const handleButtonClick = (button) => {
    setActiveButton(button);
  };

  const renderComponent = () => {
    switch (activeButton) {
      case 'Yes':
        return <YesComponent eventId={eventId} />;
      case 'No':
        return <NoComponent eventId={eventId} />;
      case 'Pending':
        return <PendingComponent eventId={eventId} />;
      default:
        return <YesComponent />;
    }
  };


  useEffect(() => {
    if (token && eventId) {
      dispatch(fetchEventsDetails({ eventId: eventId, token })).then(() => {
      });
    }
  }, [token, dispatch, eventId]);



  useEffect(() => {
    if (EventDetails?.allMemberDetails) {
      const yesCount = EventDetails.allMemberDetails.filter(member => member.requestStatus === 2).length;
      setYesCount(yesCount);
  
      const noCount = EventDetails.allMemberDetails.filter(member => member.requestStatus === 3).length;
      setNoCount(noCount);
  
      const pendingCount = EventDetails.allMemberDetails.filter(member => member.requestStatus === 1).length;
      setPendingCount(pendingCount);
    }
  }, [EventDetails]);
  



  return (
    <div className="container" >
      <div className="row mt-5">
        <div className="col-md-12 d-flex justify-content-around status-btn">
          {/* Buttons for the new component */}
          <button
            className={`btn btn-${activeButton === 'Yes' ? 'Active' : ''} mr-2`}
            onClick={() => handleButtonClick('Yes')}
          >
            Yes ({yesCount})
          </button>
          <button
            className={`btn btn-${activeButton === 'No' ? 'Active' : ''} mr-2`}
            onClick={() => handleButtonClick('No')}
          >
            No ({noCount})
          </button>
          <button
            className={`btn btn-${activeButton === 'Pending' ? 'Active' : ''}`}
            onClick={() => handleButtonClick('Pending')}
          >
            Pending ({pendingCount})
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
