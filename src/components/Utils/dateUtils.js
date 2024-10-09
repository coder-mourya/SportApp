import moment from 'moment-timezone';


// export const formatTime = (dateString, timeZone = 'UTC') => {
//     try {
//         const date = new Date(dateString);
        
//         if (isNaN(date.getTime())) {
//             throw new Error("Invalid date string");
//         }

//         const options = {
//             hour: 'numeric',
//             minute: 'numeric',
//             hour12: true,
//             timeZone: timeZone,
//         };

//         return new Intl.DateTimeFormat('en-US', options).format(date);
//     } catch (error) {
//         console.error("Error in formatTime:", error);
//         return "Invalid time";
//     }
// };





export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const day = date.getUTCDate();
    return `${year}-${month}-${day}`;
};




export function getTimeZone() {
    const now = new Date();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offsetMinutes = now.getTimezoneOffset();
    const offsetHours = Math.abs(offsetMinutes / 60);
    const offHours = Math.floor(offsetHours);
    const offsetSign = offsetMinutes < 0 ? '+' : '-';

    return {
        timeZone: timeZone,
        utc: `${offsetSign}${offHours.toString().padStart(2, '0')}:${Math.abs(offsetMinutes % 60).toString().padStart(2, '0')}`
    }

}

export function formatTime(dateTimeString, lat, long) {
    const tzlookup = require('tz-lookup');
    const moment = require('moment-timezone');


    function getTimeZoneAbbreviationForCoordinates(latitude, longitude) {
        const timeZone = tzlookup(latitude, longitude);
        const now = moment.tz(timeZone);
        let timeZoneAbbreviation = now.format('z');

        if (timeZoneAbbreviation === "+04") {
            timeZoneAbbreviation = "GST"
            return timeZoneAbbreviation;
        } if (timeZoneAbbreviation === "+0330") {
            timeZoneAbbreviation = "IRST"
            return timeZoneAbbreviation;
        }
        if (timeZoneAbbreviation === "+08") {
            timeZoneAbbreviation = "SST"
            return timeZoneAbbreviation;
        }
        if (timeZoneAbbreviation === "+07") {
            timeZoneAbbreviation = "ICT"
            return timeZoneAbbreviation;
        }

        else {
            return timeZoneAbbreviation;
        }

    }
    let timeZoneAbbreviationForNewDelhi = "";
    if (lat && long) {
        timeZoneAbbreviationForNewDelhi = getTimeZoneAbbreviationForCoordinates(lat, long);

    }
    const date = new Date(dateTimeString);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedTime = `${formattedHours}:${formattedMinutes} ${ampm} ${timeZoneAbbreviationForNewDelhi}`;
   // const  formattedTime = `${moment(dateTimeString).format("h:mm A")} ${timeZoneAbbreviationForNewDelhi}`;
    return formattedTime;
}






// export function formatDate(dateTimeString, type,) {
//     const months = [
//         'January', 'February', 'March', 'April', 'May', 'June',
//         'July', 'August', 'September', 'October', 'November', 'December'
//     ];

//     const date = new Date(dateTimeString);
//     const datee = date.getUTCDate();
//     const month = date.getUTCMonth();
//     const year = date.getUTCFullYear();
//     const date1 = datee < 10 ? `0${datee}` : datee
//     let formattedDate;
//     if (type == 'numeric') {
//         formattedDate = `${year}-${month + 1}-${date1}`;
//     } else if (type == 'month') {
//         formattedDate = `${months[month]?.slice(0, 3)}`;
//     } else if (type == 'date') {
//         formattedDate = `${date1}`;
//     } else if (type === 'fulldate') {
//         formattedDate = `${date1} ${months[month]?.slice(0, 3)}, ${year} `;
//     } else if (type === 'fullmonth') {
//         formattedDate = `${date1} ${months[month]?.slice(0, 3)} `;
//     }
//     else {
//         formattedDate = `${date1} ${months[month]?.slice(0, 3)}`;
//     }



//     return formattedDate;
// }



export function formatTime111(dateTimeString, lat, long) {
    const tzlookup = require('tz-lookup');
    const moment = require('moment-timezone');


    function getTimeZoneAbbreviationForCoordinates(latitude, longitude) {
        const timeZone = tzlookup(latitude, longitude);
        const now = moment.tz(timeZone);
        let timeZoneAbbreviation = now.format('z');

        if (timeZoneAbbreviation === "+04") {
            timeZoneAbbreviation = "GST"
            return timeZoneAbbreviation;
        } if (timeZoneAbbreviation === "+0330") {
            timeZoneAbbreviation = "IRST"
            return timeZoneAbbreviation;
        }
        if (timeZoneAbbreviation === "+08") {
            timeZoneAbbreviation = "SST"
            return timeZoneAbbreviation;
        }
        if (timeZoneAbbreviation === "+07") {
            timeZoneAbbreviation = "ICT"
            return timeZoneAbbreviation;
        }

        else {
            return timeZoneAbbreviation;
        }

    }
    let timeZoneAbbreviationForNewDelhi = "";
    if (lat && long) {
        timeZoneAbbreviationForNewDelhi = getTimeZoneAbbreviationForCoordinates(lat, long);

    }
    // const date = new Date(dateTimeString);
    // const hours = date.getUTCHours();
    // const minutes = date.getUTCMinutes();
    // const ampm = hours >= 12 ? 'PM' : 'AM';
    // const formattedHours = hours % 12 || 12;
    // const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    // const formattedTime = `${formattedHours}:${formattedMinutes} ${ampm} ${timeZoneAbbreviationForNewDelhi}`;
    const  formattedTime = `${moment(dateTimeString).format("h:mm A")} ${timeZoneAbbreviationForNewDelhi}`;
    return formattedTime;
}

export function getZone(lat, long) {
    const tzlookup = require('tz-lookup');
    const moment = require('moment-timezone');


    function getTimeZoneAbbreviationForCoordinates(latitude, longitude) {
        const timeZone = tzlookup(latitude, longitude);
        const now = moment.tz(timeZone);
        let timeZoneAbbreviation = now.format('z');
        if (timeZoneAbbreviation === "+04") {
            timeZoneAbbreviation = "GST"
            return timeZoneAbbreviation;
        } if (timeZoneAbbreviation === "+07") {
            timeZoneAbbreviation = "ICT"
            return timeZoneAbbreviation;
        }
        if (timeZoneAbbreviation === "+0330") {
            timeZoneAbbreviation = "IRST"
            return timeZoneAbbreviation;
        } if (timeZoneAbbreviation === "+08") {
            timeZoneAbbreviation = "SST"
            return timeZoneAbbreviation;
        }
        else {
            return timeZoneAbbreviation;
        }
       

    }
    let timeZoneAbbreviationForNewDelhi = "";
    if (lat && long) {
        timeZoneAbbreviationForNewDelhi = getTimeZoneAbbreviationForCoordinates(lat, long);

    }
    return `${timeZoneAbbreviationForNewDelhi}`
}



export function getTimeZoneAbbreviationForCoordinates(latitude, longitude) {
    const tzlookup = require('tz-lookup');

    const timeZone = tzlookup(latitude, longitude);
    const now = moment.tz(timeZone);
    let timeZoneAbbreviation = now.format('z');
    if (timeZoneAbbreviation === "+04") {
        timeZoneAbbreviation = "GST"
        return timeZoneAbbreviation;
    } if (timeZoneAbbreviation === "+0330") {
        timeZoneAbbreviation = "IRST"
        return timeZoneAbbreviation;
    }
    if (timeZoneAbbreviation === "+08") {
        timeZoneAbbreviation = "SGT"
        return timeZoneAbbreviation;
    }
    else {
        return timeZoneAbbreviation;
    }

}



// dateUtils.js
export function getCurrentISODateTime(date) {
    if (!date) return null;

    const originalDate = new Date(date);
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
}





