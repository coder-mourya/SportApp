import React, { useEffect } from "react";
import { fetchEventsDetails } from "../../../reducers/eventSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { ThreeDots } from "react-loader-spinner";
import { useState } from "react";
import logo from "../../../assets/img/logo.png";
import { BaseUrl } from "../../../reducers/Api/bassUrl";
import axios from "axios";
import admin from "../../../assets/afterLogin picks/My team/admin.svg";
import seting from "../../../assets/afterLogin picks/My team/admin_selected.svg";
import Modal from 'react-bootstrap/Modal';
import { toast } from "react-toastify";



const YesComponent = ({ eventId }) => {
  const EventDetails = useSelector((state) => state.events.eventDetails);
  const token = useSelector((state) => state.auth.user.data.user.token);
  const currentUser = useSelector((state) => state.auth.user.data.user);
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
      const response = await axios.get(`${downloadurl}/user/event/membersList/download/${eventId}`, {
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

  // Admin status change 
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const handleShowConfirmation = (member) => {
    // console.log("check what member ", member);
    const checkAdmin = EventDetails.allMemberDetails.some(
      (member) => member.isAdmin && member.memberId === currentUser._id
    );

    if(checkAdmin) {
      setSelectedMember(member);
      setShowConfirmation(true);
    } else {
      toast.error('Only admin can change admin status');
    }
  }

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
  }

  const handleAdminStatus = async () => {

    const adminUrl = BaseUrl();
    let isAdmin = selectedMember.isAdmin;
    let status;

    if (isAdmin) {
      status = false;
    } else {
      status = true;
    }

    let data = {
      eventId: eventId,
      memberId: selectedMember.memberId,
      isAdmin: status
    }

    // console.log("check what data sending ", data);
    // return;
    try {
      const res = await axios.put(`${adminUrl}/user/event/change/adminStatus/member`, data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.data.status === 200) {
        setShowConfirmation(false);
        dispatch(fetchEventsDetails({ eventId: eventId, token }));
        toast.success(res.data.message);
      } else {
        const errorMessage = res.data.errors ? res.data.errors.msg : 'error changing status';
        toast.error(errorMessage);

      }
    } catch (error) {
      toast.error(error.message);
    }
  }



  return (
    <div className=" ">
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
        <div className="row Yes-component"
        >

          {EventDetails?.creatorIsAdmin && (
            <div className="member-container col-md-12 d-flex py-2 my-2 rounded-3 bodyColor">
              <div className="col-md-2">
                <img src={EventDetails.allMemberDetails.find(member => member.memberId === EventDetails.creatorId).image || logo} alt="creator" style={{ width: "50px", height: "50px", borderRadius: "10%" }} />
              </div>
              <div className="col-md-8 d-flex align-items-center">
                <div>
                  <p className="text-center text-muted" style={{ marginBottom: "2px" }}>Created by</p>
                  <p>{EventDetails.creatorId === currentUser._id ? "You" : EventDetails.allMemberDetails.find(member => member.memberId === EventDetails.creatorId).fullName}</p>
                </div>
              </div>
              <div className="col-md-2 d-flex align-items-center">
                <img src={seting} alt="admin pick" style={{ width: "35px", height: "35px", cursor: "pointer" }} />
              </div>
            </div>
          )}

          {EventDetails.allMemberDetails.map((member, index) => (
            member.requestStatus === 2 && member.memberId !== EventDetails.creatorId && (
              <div key={index} className="member-container col-md-12 d-flex py-2 my-2 rounded-3 bodyColor">
                <div className="col-md-2">
                  <img src={member.image || logo} alt={member.name} style={{ width: "50px", height: "50px", borderRadius: "10%" }} />
                </div>
                <div className="col-md-8 d-flex align-items-center">
                  <div>
                    <p>{member.fullName}</p>
                  </div>
                </div>
                <div className="col-md-2 d-flex align-items-center">
                  <img src={member.isAdmin ? seting : admin} alt="admin pick"
                    style={{ width: "35px", height: "35px", cursor: "pointer" }}
                    onClick={() => handleShowConfirmation(member)}
                  />
                </div>
              </div>
            )
          ))}


        </div>
      )}

      <div className="download-list  d-flex justify-content-center mt-4">
        <button className="btn" onClick={handleDownloadList}>Download list</button>
      </div>

      <Modal show={showConfirmation} onHide={handleCloseConfirmation} centered>
        <Modal.Header closeButton style={{ borderBottom: "none" }}>
          <Modal.Title>Are you sure?</Modal.Title>
        </Modal.Header>
        <Modal.Body >
          <p>Are you sure you want to make this member an admin?</p>
          <div className="d-flex justify-content-center mt-4">
            <button className="btn btn-danger" onClick={handleCloseConfirmation} style={{ width: "100%" }}>
              Close
            </button>
            <button className="btn btn-success ms-2" onClick={handleAdminStatus} style={{ width: "100%" }}>Yes</button>
          </div>
        </Modal.Body>


      </Modal>

    </div>


  )
}

export default YesComponent;

