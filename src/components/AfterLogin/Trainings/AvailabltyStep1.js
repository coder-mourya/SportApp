import React from "react";
// import trainer from "../../../assets/afterLogin picks/home/chat1.png";
import axios from "axios";
import { useSelector } from "react-redux";
import { BaseUrl } from "../../../reducers/Api/bassUrl";
import { useState } from "react";
import { useEffect } from "react";
import { ThreeDots } from "react-loader-spinner";
import DatePicker from "react-datepicker";
import { useRef } from "react";
import moment from "moment";




const AvailabltyStep1 = ({  handleFormDataChange, formData }) => {
    const trainingDetails = useSelector((state) => state.trainings.eventDetails);

    const { days, monday, tuesday, wednesday, thursday, friday, saturday, sunday } = trainingDetails;
    // Mapping days of the week to their corresponding time slots
    const daySlotsMapping = {
        monday: monday,
        tuesday: tuesday,
        wednesday: wednesday,
        thursday: thursday,
        friday: friday,
        saturday: saturday,
        sunday: sunday,
    };

    const token = useSelector(state => state.auth.user.data.user.token);

    const [FamilyMembers, setFamilyMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingFor, setBookingFor] = useState("myself"); // State to track selected option
    const datePickerRef = useRef(null);
    const [selectedFamilyMember, setSelectedFamilyMember] = useState(null);

    // const [formData, setFormData] = useState({
    //     eventDate: "",
    //     selectedSlots: {},
    //     bookingFor: "myself",
    //     selectedFamilyMember: selectedFamilyMember
    // })



    // useEffect(() => {
    //     updateData(1, formData); // Update step 1 data in the parent
    // }, [formData, updateData]);



    // Handle radio button change
    const handleBookingForChange = (event) => {
        const value = event.target.id;
        setBookingFor(value);
        // handleFormDataChange((prevFormData) => ({
        //     ...prevFormData,
        //     bookingFor: value,
        //     selectedFamilyMember: null
        // }));

        handleFormDataChange({
            bookingFor: value,
            selectedFamilyMember: value === "myself" ? null : formData.selectedFamilyMember
        });


    };
    // console.log("famimly members list", FamilyMembers);



    useEffect(() => {
        // Fetch members data
        const GetMembers = async () => {
            setLoading(true)
            const MemberUrl = BaseUrl();

            try {
                const response = await axios.get(`${MemberUrl}/user/get-family-members`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                // console.log("family members list", response.data.data.members);
                const membersData = response.data.data.members;
                setFamilyMembers(membersData);
            } catch (error) {
                console.error("internal server error", error)

            } finally {
                setLoading(false)
            }
        }

        GetMembers();

    }, [token])



    const handleDateFocus = () => {
        if (datePickerRef.current) {
            datePickerRef.current.setOpen(true);
        }
    };

    const handleDateChange = (date) => {
        const formattedDate = moment(date).format('YYYY-MM-DD');
        // handleFormDataChange((prevFormData) => ({
        //     ...prevFormData,
        //     eventDate: formattedDate,
        //     startTime: '',
        //     endTime: ''
        // }));

        handleFormDataChange({
            startDate: formattedDate,
            // startTime: '',
            // endTime: ''
        });
    };

    const [selectedSlot, setSelectedSlot] = useState({});
    const handleSlotSelection = (day, slot) => {
        const isAlreadySelected = selectedSlot[day]?.includes(slot);
        const updatedSlots = isAlreadySelected
            ? selectedSlot[day].filter((s) => s !== slot)
            : [...(selectedSlot[day] || []), slot];

        setSelectedSlot((prevSelectedSlot) => ({
            ...prevSelectedSlot,
            [day]: updatedSlots
        }));

        handleFormDataChange({
            // selectedSlots: {
            //     ...formData.selectedSlots,
            //     [day]: updatedSlots
            // },
            [day]: updatedSlots,
            days: updatedSlots.length > 0 
            ? [...new Set([...formData.days, day])]
            :formData.days.filter((d) => d !== day)
        });
       
    };

    // Handle family member selection
    const handleFamilyMemberSelection = (member) => {
        setSelectedFamilyMember(member);
        handleFormDataChange({
            selectedFamilyMember: member
        });
    };


    const renderDaySlots = (day, slots) => {
        const selectedSlots = slots.filter(slot => slot.isSelected);
        return (
            <div className="mb-3 stols-selection" key={day}>
                <h5 className="text-danger">{day.charAt(0).toUpperCase() + day.slice(1)} Slots*</h5>
                <div style={{ display: 'flex', overflowX: 'auto', minWidth: 'max-content' }}>
                    {selectedSlots.length > 0 ? (
                        selectedSlots.map((slot, slotIndex) => (
                            <button key={slotIndex} className={`btn  me-2 mb-2  `}
                                style={{
                                    backgroundColor:
                                        selectedSlot[day]?.includes(slot.slot)
                                            ? '#007bff'
                                            : '#ffffff', // Change color when selected
                                    color: selectedSlot[day]?.includes(slot.slot)
                                        ? '#ffffff'
                                        : 'black',
                                    border: '1px solid #ccc',
                                }}
                                onClick={() => handleSlotSelection(day, slot?.slot)}
                            >
                                {slot?.slot}
                            </button>
                        ))
                    ) : (
                        <p>No available slots</p>
                    )}
                </div>
            </div>
        );
    }



    return (

        <div>
            <div className="booking-section">
                <p className="booking-title">Booking for</p>
                <div className="radio-options d-flex">
                    <div className="form-check me-4">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="bookingFor"
                            id="myself"
                            checked={bookingFor === "myself"}
                            onChange={handleBookingForChange}
                            style={{ cursor: "pointer" }}
                        />
                        <label className="form-check-label" htmlFor="myself">Myself</label>
                    </div>
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="bookingFor"
                            id="familyMember"
                            checked={bookingFor === "familyMember"}
                            onChange={handleBookingForChange}
                            style={{ cursor: "pointer" }}

                        />
                        <label className="form-check-label" htmlFor="familyMember">Family Member</label>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center loader">
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
                    // Show avatars only when "Family Member" is selected
                    bookingFor === "familyMember" && (
                        <div className="member-avatars d-flex justify-content-start mt-3">
                            {FamilyMembers.map((member, index) => {
                                const isSelected = selectedFamilyMember?._id === member?._id;

                                // console.log("selected member", selectedFamilyMember, "member", member);
                                
                                return (
                                    <div key={index} className="member-avatar d-flex justify-content-center position-relative">
                                        <img
                                            src={member.image}
                                            alt="member.name"
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                borderRadius: "50%",
                                                objectFit: "cover",
                                                cursor: "pointer",
                                                opacity: isSelected ? 0.5 : 1,
                                            }}
                                            className="mx-2"
                                            onClick={() => handleFamilyMemberSelection(member)}
                                        />

                                        {isSelected && (
                                            <div
                                                className="position-absolute top-50 start-50 translate-middle"
                                                style={{
                                                    width: "20px",
                                                    height: "20px",
                                                    backgroundColor: "green",
                                                    borderRadius: "50%",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    color: "white",
                                                    fontSize: "16px",
                                                }}
                                            >
                                                ✓
                                            </div>
                                        )}
                                    </div>
                                )
                            }

                            )}
                        </div>
                    )
                )}


                <div className="mt-3">
                    <div className=" mt-2">
                        <label htmlFor="date" className="form-label" style={{ fontSize: "14px" }}> Start Date</label>
                        <div>
                            <DatePicker
                                selected={formData.startDate ? new Date(formData.startDate) : null}
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleDateChange}
                                placeholderText="--Select--"
                                onFocus={handleDateFocus}
                                ref={datePickerRef}
                                dateFormat={"yyyy-MM-dd"}
                                minDate={new Date()}
                                className="form-control py-2 custom-date-picker"
                            />

                        </div>
                    </div>

                    <div className="mt-4">
                        <p className="mb-3">Preferred day & time</p>
                        <div className="p-3 rounded" style={{ backgroundColor: "#FBEBEB" }}>
                            {days.map((day) => {
                                const slots = daySlotsMapping[day.toLowerCase()];
                                return slots && slots.length > 0 ? (
                                    // Render only the selected slots using your existing function
                                    renderDaySlots(day, slots.filter(slot => slot.isSelected))
                                ) : (
                                    <p>No slots available for {day}</p>
                                );
                            })}
                        </div>
                    </div>


                </div>
            </div>
        </div>

    );
};

export default AvailabltyStep1;