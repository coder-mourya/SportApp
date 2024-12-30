import React from "react";
import schedule from "../../../assets/afterLogin picks/home/schedule.png";
import { useSelector } from "react-redux";
import { useState } from "react";
// import { formatDate } from "../../Utils/dateUtils";
import moment from "moment";
import currencySymbolMap from 'currency-symbol-map';



const AvailabltyStep2 = ({ availabltyData, availablityFilldData, handleFormDataChange }) => {
    const user = useSelector((state) => state.auth.user.data.user);
    const trainingDetails = useSelector((state) => state.trainings.eventDetails);
    console.log("check availablty data in step 2", availabltyData);
    // console.log("check availablty filld data in step 2", availablityFilldData);
    // const [selectedDay, setSelectedDay] = useState(null);
    const [selectedSlots, setSelectedSlots] = useState({});

    // Get the available days dynamically from availabltyData
    const availableDays = [
        { name: "Monday", slots: availabltyData?.MondayAvailableTrainings },
        { name: "Tuesday", slots: availabltyData?.TuesdayAvailableTrainings },
        { name: "Wednesday", slots: availabltyData?.WednesdayAvailableTrainings },
        { name: "Thursday", slots: availabltyData?.ThursdayAvailableTrainings },
        { name: "Friday", slots: availabltyData?.FridayAvailableTrainings },
        { name: "Saturday", slots: availabltyData?.SaturdayAvailableTrainings },
        { name: "Sunday", slots: availabltyData?.SundayAvailableTrainings },
    ].filter(day => day?.slots && day?.slots?.length > 0);

    // Handle selecting a day
    // const handleDaySelection = (day) => {
    //     setSelectedDay(day);
    //     setSelectedSlot(null); // Reset slot selection when a new day is selected
    // };

    // Handle selecting a slot
    // const handleSlotSelection = (day, slot) => {
    //     setSelectedSlots(prevSelectedSlots => ({
    //         ...prevSelectedSlots,
    //         [day]: prevSelectedSlots[day] === slot ? null : slot // Toggle slot selection
    //     }));
    // };

    const handleSlotSelection = (day, slot) => {
        setSelectedSlots(prevSelectedSlots => {
            const currentSlots = prevSelectedSlots[day] || [];
            const slotAlreadySelected = currentSlots.includes(slot);
    
            const updatedSlots = slotAlreadySelected
                ? currentSlots.filter(s => s !== slot) // Remove slot if already selected
                : [...currentSlots, slot]; // Add slot if not selected
    
            return {
                ...prevSelectedSlots,
                [day]: updatedSlots
            };
        });
    };
    

    const [selectedDates, setSelectedDates] = useState({});
    const [expectation, setExpectation] = useState('');


    // const handleDateSelection = (day, slot, date) => {
    //     setSelectedDates(prevSelectedDates => {
    //         const daySlots = prevSelectedDates[day] || {};
    //         const currentDates = daySlots[slot] || [];
    //         const dateAlreadySelected = currentDates.includes(date);
    
    //         // Add or remove the date
    //         const updatedDates = dateAlreadySelected
    //             ? currentDates.filter(d => d !== date) // Remove date if already selected
    //             : [...currentDates, date]; // Add date if not selected
    
    //         const updatedDaySlots = {
    //             ...daySlots,
    //             [slot]: updatedDates // Update dates for the specific slot
    //         };
    
    //         const newSelectedDates = {
    //             ...prevSelectedDates,
    //             [day]: updatedDaySlots // Update day with slots and their dates
    //         };
    
    //         // Flatten all selected dates for all slots and days
    //         const totalSession = Object.values(newSelectedDates).flatMap(daySlots =>
    //             Object.values(daySlots).flat()
    //         );
    
    //         // Update formData for step2 (totalSession array)
    //         handleFormDataChange({ totalSession }, 'step2');
    
    //         return newSelectedDates;
    //     });
    // };
    
    const handleDateSelection = (day, slot, date) => {
        setSelectedDates(prevSelectedDates => {
            const daySlots = prevSelectedDates[day] || {};
            const currentDates = daySlots[slot] || [];
            const dateAlreadySelected = currentDates.includes(date);
    
            // Add or remove the date
            const updatedDates = dateAlreadySelected
                ? currentDates.filter(d => d !== date) // Remove date if already selected
                : [...currentDates, date]; // Add date if not selected
    
            const updatedDaySlots = {
                ...daySlots,
                [slot]: updatedDates // Update dates for the specific slot
            };
    
            const newSelectedDates = {
                ...prevSelectedDates,
                [day]: updatedDaySlots // Update day with slots and their dates
            };
    
            // Calculate the total count of selected dates (total sessions)
            const totalSessionCount = Object.values(newSelectedDates).reduce((total, daySlots) =>
                total + Object.values(daySlots).reduce((slotTotal, dates) => slotTotal + dates.length, 0), 0
            );
    
            // Update formData for step2 (with totalSession count)
            handleFormDataChange({ totalSession: totalSessionCount }, 'step2');
    
            return newSelectedDates;
        });
    };
    








    return (
        <div>

            <div className="d-flex justify-content-start align-items-center">
                {availablityFilldData?.bookingFor === "familyMember" ? (
                    <img src={availablityFilldData?.selectedFamilyMember?.image} alt="tainer" style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                    <img src={user?.profileImage} alt="tainer" style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }} />
                )}


                {availablityFilldData?.bookingFor === "familyMember" ? (
                    <h5 className="ms-3">{availablityFilldData?.selectedFamilyMember?.fullName}</h5>
                ) : (
                    <h5 className="ms-3">You</h5>
                )}

            </div>

            <div className="mt-3 rounded-3 bodyColor p-2">
                <div className="row">
                    <div className="col-md-5 d-flex justify-content-center align-items-center">
                        <img src={trainingDetails?.coverImage} alt="" className="rounded-3" style={{ width: "159px", height: "150px", objectFit: "cover" }} />
                    </div>

                    <div className="col-md-7">
                        <div className="d-flex align-items-center mt-2">
                            <img src={schedule} alt="watch" />
                            <p className="ms-2 pb-0 mb-0">{availablityFilldData?.startDate}</p>
                        </div>



                        <div className="mt-2">
                            <h4>{trainingDetails?.trainingName}</h4>
                            <p>Minimum session of {trainingDetails?.minimumSession}</p>
                            <p>Maximum session of {trainingDetails?.maximumSession}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h4>Your Planned Sessions</h4>
                <p>To be attended before 31st March, 2023</p>
                <p className="text-danger">Adjust your training sessions below:</p>
            </div>
            {availableDays?.map((days, index) => {
                return (
                    <div key={index}>
                        <h5 className="">{days?.name} slots</h5>
                        <div className="p-3 rounded stols-selection" style={{ backgroundColor: "#FBEBEB" }}>

                            {/* Slot buttons */}
                            <div className="d-flex justify-content-between align-items-center">
                                {[...new Set(days?.slots?.map(slot => slot.slot))].map((slot, slotIndex) => {
                                    const isSelected = selectedSlots[days.name]?.includes(slot); // Check if this slot is selected for this day

                                    // console.log("check color", selectedSlots);
                                    
                                    return (
                                        <div key={slotIndex}>
                                            <button className="btn"
                                                onClick={() => handleSlotSelection(days.name, slot)}
                                                style={{
                                                    backgroundColor: isSelected ? '#007bff' : '#ffffff', // Change color when selected
                                                    color: isSelected ? '#ffffff' : 'black',
                                                    border: '1px solid #ccc',
                                                }}
                                            >
                                                {slot}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Date grid (appears when a slot is clicked) */}
                            {selectedSlots[days.name]?.map((slot, slotIndex) => {
                             
                                return (
                                    <div key={slotIndex}>
                                    {/* <h6>{slot} - Dates</h6> */}
                                    <div className="mt-3 d-flex justify-content-between" style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                                        {days?.slots
                                            .filter(s => s.slot === slot) // Only show dates for the current slot
                                            .map((s, dateIndex) => {
                                                const isSelectedDate = selectedDates[days.name]?.[slot]?.includes(s.date);
                                                return (
                                                    <button
                                                    key={dateIndex}
                                                    className="btn mx-2 "
                                                    style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        backgroundColor: isSelectedDate ? '#007bff' : '#ffffff',
                                                        color: isSelectedDate ? '#ffffff' : '#6C757D' ,
                                                        border: '1px solid #ccc',
                                                        borderRadius: '8px'
                                                    }}
                                                    onClick={() => handleDateSelection(days.name, slot, s.date)} // Pass slot and date
                                                >
                                                    {moment(s?.date).format("MMM DD")}
                                                </button>
                                                )
                                            }
                                               
                                            )}
                                    </div>
                                </div>
                                )
                            }
                               
                            )}

                        </div>
                    </div>
                );
            })}





            <div className="sesion-price mt-3 d-flex justify-content-between">
                <p>Price per session</p>
                <p className="fw-bold">
                    {currencySymbolMap(trainingDetails?.currency)}{trainingDetails?.price}

                </p>
            </div>

            <div className=" expectation">
                <label htmlFor="description" className="form-label">Expectation from Training</label>
                <textarea
                    id="description"
                    name="description"
                    placeholder="Write your Expectation"
                    className="custom-textarea"
                    rows="4"
                    value={expectation}
                    onChange={(e) => {
                        setExpectation(e.target.value);
                        handleFormDataChange({
                            expectations: e.target.value
                        }, 'step2'); // Store expectations in step2
                    }}
                />
            </div>
        </div>
    );
};

export default AvailabltyStep2;