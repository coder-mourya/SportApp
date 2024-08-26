import React, { useEffect, useState } from "react";
import Sidebar from "../../components/AfterLogin/Sidebar";
import SidebarSmallDevice from "../../components/AfterLogin/SidebarSmallDevice";
import All from "../../components/AfterLogin/Schedule/All";
import EventSchedule from "../../components/AfterLogin/Schedule/EventSchedule";
import TrainingSchedule from "../../components/AfterLogin/Schedule/TrainingSchedule";
import "../../assets/Styles/colors.css";
import "../../assets/Styles/AfterLogin/createTeam.css";
// import { useNavigate } from "react-router-dom";
import event from "../../assets/afterLogin picks/home/event.png"
import 'react-calendar/dist/Calendar.css';
import "../../assets/Styles/AfterLogin/schedule.css"
import { useSelector } from "react-redux";
import eventPick from "../../assets/afterLogin picks/home/img.png";
import location from "../../assets/afterLogin picks/home/location.png";
import watch from "../../assets/afterLogin picks/home/watch.png";
import schedule from "../../assets/afterLogin picks/home/schedule.png";
import practice from "../../assets/afterLogin picks/Practice/practice.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BaseUrl } from "../../reducers/Api/bassUrl";
import { useCallback } from "react";


import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { formatDate, formatTime } from "../../components/Utils/dateUtils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, isSameMonth, isToday} from 'date-fns';
import { ThreeDots } from "react-loader-spinner";
import { ToastContainer } from "react-toastify";
import { fetchSchedule } from "../../reducers/scheduleSlice";
import { useDispatch } from "react-redux";
// import moment from "moment";
// import moment from "moment";




// custom celendar
const CustomCalendar = ({ onDateSelect, syncDates }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    // const [selectedDate, setSelectedDate] = useState('');
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const todayIndex = daysInMonth.findIndex(day => isToday(day))
    const goToPreviousMonth = () => setCurrentDate(addMonths(currentDate, -1));
    const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 7,
        slidesToScroll: 7,
        swipeToSlide: true,
        swipe: true,
        arrows: true,
        initialSlide: todayIndex,

    };

    const handleDateClick = (day) => {
        const formattedDate = format(day, 'yyyy-MM-dd');
        // setSelectedDate(formattedDate);
        onDateSelect(formattedDate);
    };



    // console.log("event dates ", syncDates);
    // const hasEvent = (date) => {
    //     console.log("event dates ", date);

    //     return syncDates?.some(event =>
    //         isSameDay(date, new Date(event?.event?.eventDateUTC || event?.eventDateUTC))
    //     )        
    // }


    const hasEvent = (date) => {
        const dateIso = formatDate(date);
        // console.log("event dates ", dateIso);
        const result = syncDates?.some(event => {
            let eventDateUtc;

            if (event?.eventDateUTC) {

                eventDateUtc = formatDate(event?.eventDateUTC)
                // console.log("out side trure", eventDateUtc);
            } else if (event?.event?.eventDateUTC) {

                eventDateUtc = formatDate(event?.event?.eventDateUTC)
                // console.log("inside trure", eventDateUtc);
            } else {
                eventDateUtc = null;
            }

            if (eventDateUtc === null) {
                return false;
            }

            const isSame = dateIso === eventDateUtc
            return isSame
        })
        // console.log(`Final result for date ${dateIso}: ${result ? 'true' : 'false'}`);

        return result
    }





    return (
        <div className="custom-calendar">
            <div className="calendar-header d-flex justify-content-center mb-4">
                <button className="me-4" onClick={goToPreviousMonth}>&lt;</button>
                <h2>{format(currentDate, 'MMMM yyyy')}</h2>
                <button className="ms-4" onClick={goToNextMonth}>&gt;</button>
            </div>

            <Slider {...settings}>
                {daysInMonth.map(day => {
                    const hasEventforDay = hasEvent(day);
                    // console.log(`Date: ${format(day, 'yyyy-MM-dd')} - Has Event: ${hasEventforDay}`);

                    return (
                        <div key={day.toString()} className="calendar-slide mt-2">
                            <div className={`calendar-cell ${isToday(day) ? 'today' : ''}`}>
                                <div className="weekday my-2">{format(day, 'EEE')}</div>

                                <div className="d-flex  justify-content-center">
                                    <div className={`date  ${!isSameMonth(day, currentDate) ? 'different-month' : ''}`}
                                        onClick={() => handleDateClick(day)}
                                    >
                                        {format(day, 'd')}
                                        <p className={`ms-3 ${hasEventforDay ? 'highlighted' : ''}`}
                                        ></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </Slider>
        </div>
    );
};



const Schedule = () => {
    const [selectedOption, setSelectedOption] = useState("Practice");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mainContainerClass, setMainContainerClass] = useState('col-md-11');
    const Navigate = useNavigate();

    // get event dates 
    //   const [eventDate, setEventDate] = useState([]);
    const token = useSelector((state) => state.auth.user.data.user.token);
    const [selectedDate, setSelectedDate] = useState('');
    // const [eventData, setEventData] = useState([]);
    const eventData = useSelector((state) => state.schedules.schedules);
    // console.log("event data  from redux", eventData);

    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    //   console.log("event dates in schedule", eventData);


    useEffect(() => {
        const getCurrentISODateTime = (date) => {
            if (!date) return null;
            let originalDate = new Date(date);
            if (isNaN(originalDate.getTime())) return null;

            const isoDateTime = `${originalDate.getFullYear()}-${(originalDate.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${originalDate.getDate()
                    .toString()
                    .padStart(2, '0')}T${originalDate.getHours()
                        .toString()
                        .padStart(2, '0')}:${originalDate.getMinutes()
                            .toString()
                            .padStart(2, '0')}:${originalDate.getSeconds()
                                .toString()
                                .padStart(2, '0')}.${originalDate.getMilliseconds()
                                    .toString()
                                    .padStart(3, '0')}Z`;

            return isoDateTime;
        };

        const formattedDate = getCurrentISODateTime(selectedDate) || getCurrentISODateTime(new Date());

        if (!formattedDate || formattedDate === "NaN-NaN-NaNTNaN:NaN:NaN.NaNZ") {
            return;
        }

        if (token) {
            setLoading(true);
            dispatch(fetchSchedule({ token, date: formattedDate })).then(() => {
                setLoading(false);
            });
        }
    }, [token, selectedDate, dispatch]);




    const handleDateSelect = (date) => {
        setSelectedDate(date);
    };

    // sync dates
    const [syncDates, setSyncDates] = useState([]);

    const getSyncDates = useCallback(async () => {
        setLoading(true);
        const syncUrl = BaseUrl();
        try {
            const getCurrentISODateTime = (date) => {
                if (!date) return null;
                let originalDate = new Date(date);
                if (isNaN(originalDate.getTime())) return null;

                const isoDateTime = `${originalDate.getFullYear()}-${(originalDate.getMonth() + 1).toString().padStart(2, '0')}-${originalDate.getDate().toString().padStart(2, '0')}T${originalDate.getHours().toString().padStart(2, '0')}:${originalDate.getMinutes().toString().padStart(2, '0')}:${originalDate.getSeconds().toString().padStart(2, '0')}.${originalDate.getMilliseconds().toString().padStart(3, '0')}Z`;

                // console.log("getCurrentISODateTime", isoDateTime);
                return isoDateTime;
            }
            const formatedDate = getCurrentISODateTime(new Date());
            let data = {
                date: formatedDate
            }

            const res = await axios.get(`${syncUrl}/user/event/get-mySchedules-sync`, {
                params: data,
                headers: {
                    Authorization: `Bearer ${token}`
                }

            });

            if (res.data.status === 200) {
                // console.log("sync  dates from mySchedules-sync ", res.data);
                setSyncDates(res.data.data.eventList);
            } else {
                console.log("error syncing dates", res.data);
            }
        } catch (error) {
            console.log("error syncing dates", error);
        } finally {
            setLoading(false);
        }

    }, [token])


    useEffect(() => {
        getSyncDates();
    }, [getSyncDates])

    const handleSyncClick = () => {
        getSyncDates();
    };


    // const Navigate = useNavigate();
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
        setMainContainerClass(sidebarOpen ? 'col-md-11 ' : 'col-md-10 ');
    };


    // handle options slections
    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };

    const renderComponent = () => {
        switch (selectedOption) {
            case "Game":
                return <EventSchedule eventData={eventData} />;
            case "Tournament":
                return <TrainingSchedule eventData={eventData} />;
            default:
                return <All eventData={eventData} />;
        }
    };


    //  get pending events from api

    const [pendingPayment, setPendingPayment] = useState([]);
    // const token = useSelector((state) => state.auth.user.data.user.token);

    // console.log("event data", eventData);


    useEffect(() => {
        const url = BaseUrl();
        const getEvents = async () => {
            try {
                const response = await axios.get(`${url}/user/event/get-pendingPayments`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (response.status === 200) {
                    // console.log("event data", response.data.data);

                    setPendingPayment(response.data.data.eventData.eventList)
                }
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        }

        getEvents()
    }, [token])

    // navigate to event details
    const handleEVentClick = (event) => {
        // console.log("event id coming ", event);        
        Navigate("/EventDetails", { state: { event: event } });
    }


    return (
        <div className="container-fluid create-team  bodyColor ">
            <div className="row">
                <div className="col">
                    <Sidebar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                    <SidebarSmallDevice />
                </div>
                <div className={`${mainContainerClass}  main mt-2`}>


                    <div className="upper-contant ">
                        <div className="row All-options my-4 d-flex justify-content-center  justify-content-md-start">
                            <div className="col-md-6 col-lg-6 Team-options itemsColor py-2  text-center rounded ">
                                <button
                                    className={`btn ${selectedOption === "Practice" ? "btn-primary" : ""}`}
                                    onClick={() => handleOptionChange("Practice")}
                                >
                                    All
                                </button>
                                <button
                                    className={`btn ${selectedOption === "Game" ? "btn-primary" : ""}`}
                                    onClick={() => handleOptionChange("Game")}
                                >
                                    Event
                                </button>
                                <button
                                    className={`btn ${selectedOption === "Tournament" ? "btn-primary" : ""}`}
                                    onClick={() => handleOptionChange("Tournament")}
                                >
                                    Training
                                </button>
                            </div>
                            <div className="col-md-6 col-lg-6 create-options py-2 ">
                                <div className=" d-flex justify-content-md-end justify-content-center ">
                                    <button className="btn py-2 sync-btn"
                                        style={{
                                            border: "1px solid #ccc",
                                            color: "#283593",
                                            backgroundColor: "#ffffff",
                                        }}
                                        onClick={handleSyncClick}
                                    >
                                        <img src={event} alt="calender pick"
                                            style={{
                                                width: "20px",
                                                marginRight: "5px",
                                            }}
                                        />
                                        Sync calendar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row ">
                        <div className="col-md-8 mb-4" >
                            <ToastContainer />
                            <div className="itemsColor p-4 rounded-4 training-dashbord schedule-container"
                                style={{ height: "39rem" }}
                            >

                                <div className="calendar-container ">
                                    <CustomCalendar onDateSelect={handleDateSelect} syncDates={syncDates} />

                                </div>

                                <div className="container-fluid">
                                    {/* {renderComponent()} */}

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
                                        renderComponent()
                                    )}

                                </div>
                            </div>
                        </div>



                        <div className="col-md-4">
                            <div className="calender rounded-4 itemsColor py-2 px-4" style={{ height: "39rem" }}>
                                {pendingPayment.length > 0 ? (
                                    pendingPayment.map((event, index) => {
                                        const eventFormatedDate = formatDate(event.eventDate);
                                        const eventEndTime = formatTime(event.endTime);
                                        const eventFormatedStartTime = formatTime(event.startTime);

                                        return (

                                            <div key={index} className="p-3  my-2 rounded-4  row"
                                                style={{ backgroundColor: "#FDF4F4", border: "0.6px solid #EDACAC", cursor: "pointer" }}
                                                onClick={() => handleEVentClick(event)}
                                            >
                                                <div className="col-md-3 position-relative p-0 d-flex align-content-center">
                                                    <img src={eventPick} alt="event pick" className="img-fluid eventpick" />
                                                    <img src={event.sport.selected_image} alt="event pick" className="img-fluid eventpick"
                                                        style={{
                                                            width: "35px",
                                                            position: "absolute",
                                                            top: "50%",
                                                            left: "52%",
                                                            transform: "translate(-50%, -50%)"
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-md-9 ">
                                                    <h4 className="mb-2">{window.innerWidth < 576 ? event.eventName.substring(0, 10) + ".." : event.eventName}</h4>
                                                    <div className="mb-2">
                                                        <div className="d-flex align-items-center">
                                                            <img src={location} alt="location" className="me-2" style={{ width: "20px", height: "20px" }} />
                                                            <p className="mb-0">
                                                                {window.innerWidth > 20 ? event.address.substring(0, 25) + "..." : event.address}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="mb-2">
                                                        <div className="d-flex align-items-center">
                                                            <img src={schedule} alt="schedule" className="me-2" style={{ width: "20px", height: "20px" }} />
                                                            <p className="mb-0">{eventFormatedDate}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="d-flex align-items-center">
                                                            <img src={watch} alt="watch" className="me-2" style={{ width: "20px", height: "20px" }} />
                                                            <p className="mb-0">{eventFormatedStartTime} - {eventEndTime}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        );
                                    })
                                ) : (
                                    <div className="row justify-content-center align-items-center p-5">
                                        <div className="col-12 text-center">
                                            <img src={practice} alt="team pick" className="img-fluid mb-3" />
                                            <p className="mb-0">You have no Payemnt pending</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Schedule;
