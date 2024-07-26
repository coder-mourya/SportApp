import React, { useEffect } from "react";
import { fetchEventsDetails } from "../../../reducers/eventSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { ThreeDots } from "react-loader-spinner";
import { useState } from "react";
import logo from "../../../assets/img/logo.png";
import { BaseUrl } from "../../../reducers/Api/bassUrl";
import axios from "axios";


const YesComponent = ({ eventId }) => {
  const EventDetails = useSelector((state) => state.events.eventDetails);
  const token = useSelector((state) => state.auth.user.data.user.token);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  // fetch event details
  useEffect(() => {
    dispatch(fetchEventsDetails({ eventId: eventId, token })).then(() => {
      setLoading(false);
    });
  }, [token, dispatch, eventId]);

  // download list of members

  const handleDownloadList = async () => {
    const downloadurl = BaseUrl();

    try {
      const response = await axios.get(`${downloadurl}/user/event/membersList/download/${eventId}`,{
        responseType: "blob",
      })

       // Create a URL for the file
       const url = window.URL.createObjectURL(new Blob([response.data]));
       const link = document.createElement('a');
       link.href = url;
       link.setAttribute('download', `${EventDetails.eventName}_membersList.csv`); // or any other file extension
       document.body.appendChild(link);
       link.click();

       // Clean up and remove the link
       link.parentNode.removeChild(link);
      
    } catch (error) {
      console.error('Error downloading the file', error);
    }
  }

  return (
    <div className="Yes-component ">
      {loading ? (
        <div className="text-center loader flex-grow-1 d-flex justify-content-center align-items-center">
          <ThreeDots
            height={80}
            width={80}
            color="green"
            ariaLabel="loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>

      ) : (
        <div className="row ">
          {EventDetails.allMemberDetails.map((member, index) => (
            <div key={index} className="member-container col-md-12 d-flex  py-2 my-2 rounded-3">
              <img src={member.image || logo} alt={member.name}
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",

                }}
              />
              <div className=" d-flex justify-content-center align-items-center">

                <p className="ms-2">{member.fullName}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="download-list d-flex justify-content-center mt-4">
        <button className="btn" onClick={handleDownloadList}>Download list</button>
      </div>
    </div>
  )
}

export default YesComponent;