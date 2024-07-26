import edit from "../../../assets/afterLogin picks/events/edit.svg"
import React, { useEffect } from "react";
import { fetchEventsDetails } from "../../../reducers/eventSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { ThreeDots } from "react-loader-spinner";
import { useState } from "react";
import Member from "../../../assets/afterLogin picks/My team/Member.svg";
import Modal from 'react-bootstrap/Modal';
import "../../../assets/Styles/AfterLogin/event.css"
import { BaseUrl } from "../../../reducers/Api/bassUrl";
import axios from "axios";
import { toast } from "react-toastify";


const AllExpenses = ({ eventId }) => {
    const EventDetails = useSelector((state) => state.events.eventDetails);
    const token = useSelector((state) => state.auth.user.data.user.token);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        eventId: "",
        title: "",
        cost: "",
        currencyCode: "USD"
        ,
    })

    // fetch event details
    useEffect(() => {
        dispatch(fetchEventsDetails({ eventId: eventId, token })).then(() => {
            setLoading(false);
        });
    }, [token, dispatch, eventId]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };


    // Add Expenses

    const [showAddExpenses, setShowAddExpenses] = useState(false);
    const handleShowAddExpenses = () => setShowAddExpenses(true);
    const handleCloseAddExpenses = () => setShowAddExpenses(false);

    const handleAddCost = async () => {
        const adCostUrl = BaseUrl();

        let data = {
            eventId: eventId,
            title: formData.title,
            cost: formData.cost,
            currencyCode: formData.currencyCode
        }

        // console.log("add cost data ", data);
        // return;

        try {
            const res = await axios.post(`${adCostUrl}/user/event/add/expense`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })

            if (res.status === 200) {
                toast.success("Expenses added successfully");
                handleCloseAddExpenses();
            } else {
                const errorMessage = res.data.errors ? res.data.errors.msg : "Error adding expenses";
                toast.error(errorMessage);
            }
        } catch (error) {
            toast.error("internal server error");
        }
    }


    return (
        <div className="AllExpences">

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
                <div className="row mt-4 members-expences">
                    {EventDetails.eventExpenses.length === 0 ? (
                        <div className="py-5 d-flex flex-column">
                            <div className="d-flex justify-content-center align-items-center">
                                <img src={Member} alt="member pick" className="img-fluid"
                                    style={{ width: "250px", height: "250px" }}
                                />
                            </div>
                            <p className="text-center mt-2">There are no expenses.</p>

                            <div className="mt-5">
                                <button className="btn "
                                    style={{
                                        width: "100%",
                                        backgroundColor: "#D32F2F",
                                        color: "white",
                                    }}

                                    onClick={handleShowAddExpenses}
                                >Add Expenses</button>
                            </div>
                        </div>

                    ) : (
                        EventDetails.eventExpenses.map((expence, index) => (
                            <div className="member-container my-2 d-flex justify-content-center">
                                <div key={index} className=" d-flex justify-content-between align-items-center rounded-3"
                                    style={{
                                        backgroundColor: "#F4F5F9",
                                        border: "1px solid #E9EAF3",
                                        width: "100%",
                                    }}
                                >

                                    <div className="pt-3 ps-2">
                                        <h6>{expence.title}</h6>
                                        <p>  &#36;  {expence.cost}</p>
                                    </div>
                                    <div className="me-4 d-flex justify-content-center edit">
                                        <img src={edit} alt="edit" />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}


            <Modal show={showAddExpenses} onHide={handleCloseAddExpenses} centered>
                <Modal.Header closeButton style={{ borderBottom: "none" }}>
                    <Modal.Title className="text-center">Add Cost</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="px-3">
                        <form >
                            <div>
                                <label htmlFor="title">Title</label>
                                <input type="text"
                                    placeholder="Enter here"
                                    id="title"
                                    name="title"
                                    className="form-control py-2 mt-2"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="mt-3">
                                <label htmlFor="about">Amount</label>
                                <input type="text"
                                    placeholder="Enter Amount"
                                    id="cost"
                                    name="cost"
                                    className="form-control py-2 mt-2"
                                    value={formData.cost}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </form>

                        <div className="mt-5 add-cost-btn">
                            <button className="btn"
                                style={{ width: "100%", backgroundColor: "#D32F2F", color: "white" }}
                                onClick={handleAddCost}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </Modal.Body>

            </Modal>

        </div>
    )
}

export default AllExpenses;