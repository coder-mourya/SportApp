import React from "react";
import history from "../../../assets/afterLogin picks/Practice/history.svg";

const Sessions = () => {
    const dates = [
        { month: "January", days: [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31] },
        { month: "February", days: [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28] },
        { month: "March", days: [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31] }
    ];

    return (
        <div className="sessions">
            <div className="session-container">
                <h4>Your planned session</h4>
                <p>To be attended before 21st April, 2023</p>
            </div>
            <hr style={{ borderTop: '2px solid #EAEBF5', margin: 0 }} />
            <div className="mt-4 sessions-months">
                {dates.map((monthData, index) => (
                    <div key={index}>
                        <p>{monthData.month}</p>
                        <ul>
                            {monthData.days.map(day => (
                                <li key={day}>{day}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="session-btn d-flex justify-content-center">
                <button className="btn"><img src={history} alt="Attendance history" />Attendance history</button>
            </div>
        </div>
    );
};

export default Sessions;
