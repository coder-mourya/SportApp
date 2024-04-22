module.exports = {
  jwtSecret: "csk12chpn3ban2yrscmebckaftr2yrswn3ipl",
  baseUrl: "https://localhost:5000/",
  //Url: "http://localhost:3000",
  //Url: "http://quippyadmin.s3-website.us-east-2.amazonaws.com",

  //push notification text

  //for book appoinments
  APPOINTMENT_CONFIRMATION_TITLE : "New appointment",
  USER_APPOINTMENT_CONFIRMATION_MESSAGE:
    "Hi %s, your appointment has been booked by %s. Please log in to our platform to join the video call at the scheduled date and time. If you have any questions or need to reschedule, please let us know as soon as possible. Thank you!",
  DOCTOR_APPOINTMENT_CONFIRMATION_MESSAGE:
    "Hi %s, you have successfully booked an appointment for %s. The user has been notified of the appointment details, and will receive a reminder message before the scheduled date and time. Thank you for using our service!",

  //for reschedule appoinments
  APPOINTMENT_RESCHEDULE_TITLE : "Reschedule appointment", 
  APPOINTMENT_RESCHEDULE_MESSAGE:"Hi %s, we regret to inform you that your appointment on %s has been rescheduled to %s. We apologize for any inconvenience this may cause. Please log in to our platform to view the updated appointment details.",
  
  formatMessage: function (message, ...args) {
    return message.replace(/%s/g, function () {
      return args.shift();
    });
  },
};
