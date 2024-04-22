module.exports = {
    conver12HourTo24Hour: async (time) => {       
        const [hours, minutes, period] = time.match(/(\d{1,2}):(\d{2}) ([AP]M)/).slice(1);
        const isPM = period === 'PM' && hours !== '12';
        const convertedHours = isPM ? parseInt(hours, 10) + 12 : parseInt(hours, 10);
        return `${convertedHours.toString().padStart(2, '0')}:${minutes}`;

    }, 

    convertStringToDateObject: async(dateString) => {
        const dateObjectUTC = new Date(Date.UTC(
            parseInt(dateString.substr(0, 4), 10), // Year
            parseInt(dateString.substr(5, 2), 10) - 1, // Month (0-indexed)
            parseInt(dateString.substr(8, 2), 10), // Day
            parseInt(dateString.substr(11, 2), 10), // Hours
            parseInt(dateString.substr(14, 2), 10), // Minutes
            parseInt(dateString.substr(17, 2), 10), // Seconds
            parseInt(dateString.substr(20, 3), 10) // Milliseconds
        ));

        return dateObjectUTC;
    }
};