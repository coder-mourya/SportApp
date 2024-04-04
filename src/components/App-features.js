import React from "react";
import "./appFeacturers.css";
import Contact from "./Contact";
import Team from "./FeaturesImg/team.png"
import Player from "./FeaturesImg/player.png";
import Training from "./FeaturesImg/training.png";
import Attendance from "./FeaturesImg/attendance.png";
import Feedback from "./FeaturesImg/rating.png";
import Security from "./FeaturesImg/security.png";
import Event from "./FeaturesImg/event planning.png";
import Mailer from "./FeaturesImg/mailer.png";
import Expences from "./FeaturesImg/expenses.png";
import Calander from "./FeaturesImg/calendar.png";
import Chat from "./FeaturesImg/chat.png";
import user from "./FeaturesImg/user.png";
import personalized from "./FeaturesImg/personalized.png";
import notification from "./FeaturesImg/notification.png";
import Interactive from "./FeaturesImg/Interactive.png";
import app from "./FeaturesImg/app.png";
import stories from "./FeaturesImg/stories.png";
import support from "./FeaturesImg/support.png";
import tracking from "./FeaturesImg/tracking.png";
import coach from "./FeaturesImg/coach.png";
import share from "./FeaturesImg/share.png";




const Features = () => {
   return (

      <div className="container-fluid g-0">

         <div className="features-Head d-flex justify-content-center align-items-center about text-white">
            <h1>App Features</h1>
         </div>


         <div className="features mt-5">

            <div className="container-fluid">

               <div className="row d-flex justify-content-center Feactures-border ">

                  <div className="team-building text-start cards col-md-4 my-2 row">

                     <div className="col-md-3">

                        <img src={Team} alt="team building" className="card-pick" />
                     </div>

                     <div className="col-md-9">

                        <h5>Team Building</h5>
                        <p>Create and manage sports teams
                           with customizable roles and
                           administrators.</p>
                     </div>
                  </div>

                  <div className="Player Profiles text-start cards col-md-4 my-2 row">

                     <div className="col-md-3">

                        <img src={Player} alt="player" className="card-pick" />
                     </div>
                     <div className="col-md-9">

                        <h5>Player Profiles</h5>
                        <p>
                           Detailed profiles showcasing player
                           backgrounds, expertise, and
                           expectations.
                        </p>
                     </div>

                  </div>



                  <div className="Training Listings text-start cards col-md-4 my-2 row">

                     <div className="col-md-3">

                        <img src={Training} alt="training" className="card-pick" />
                     </div>

                     <div className="col-md-9">

                        <h5>Training Listings</h5>
                        <p>
                           Discover tailored training sessions
                           based on skill and location.
                        </p>
                     </div>
                  </div>
               </div>

               <div className="row  d-flex justify-content-center Feactures-border" >

                  <div className="Attendance Tracking text-start cards col-md-4 my-2 row">
                     <div className="col-md-3">

                        <img src={Attendance} alt="attendance " className="card-pick" />
                     </div>

                     <div className="col-md-9">

                        <h5>Attendance Tracking</h5>
                        <p>
                           Effortless attendance tracking with
                           QR codes, fostering commitment.
                        </p>
                     </div>
                  </div>

                  <div className="Feedback and Ratings text-start cards col-md-4 my-2 row">
                     <div className="col-md-3">

                        <img src={Feedback} alt=" feedback" className="card-pick" />
                     </div>

                     <div className="col-md-9">

                        <h5>Feedback and Ratings</h5>
                        <p>
                           Coaches provide personalized
                           feedback, users rate sessions.
                        </p>
                     </div>

                  </div>


                  <div className="Security and Privacy text-start cards col-md-4 my-2 row">
                     <div className="col-md-3">

                        <img src={Security} alt="Security" className="card-pick" />
                     </div>
                     <div className="col-md-9">

                        <h5>Security and Privacy</h5>
                        <p>Robust data security through
                           authentication and protection
                           measures.</p>
                     </div>
                  </div>

               </div>

               <div className="row  d-flex justify-content-center Feactures-border" >

                  <div className="Attendance Tracking text-start cards col-md-4 my-2 row">
                     <div className="col-md-3">

                        <img src={Event} alt="event " className="card-pick" />
                     </div>

                     <div className="col-md-9">

                        <h5>Event Planning</h5>
                        <p>
                           Easily schedule practice sessions,
                           matches, and tournaments.
                           Acceptance and decline options.
                        </p>
                     </div>
                  </div>

                  <div className="Feedback and Ratings text-start cards col-md-4 my-2 row">
                     <div className="col-md-3">

                        <img src={Mailer} alt=" mailer" className="card-pick" />
                     </div>

                     <div className="col-md-9">

                        <h5>Quick Mailer Engine</h5>
                        <p>
                           orem ipsum dolor sit amet, consec
                           tetur adipiscing elit. Ut elit tellus,
                           luc tus nec ullamcorper.
                        </p>
                     </div>

                  </div>


                  <div className="Security and Privacy text-start cards col-md-4 my-2 row">
                     <div className="col-md-3">

                        <img src={Expences} alt="expenses" className="card-pick" />
                     </div>
                     <div className="col-md-9">

                        <h5>Expense Tracking</h5>
                        <p>Record event expenses, split
                           payments among attendees, and
                           transparent financial tracking.</p>
                     </div>
                  </div>

               </div>

               <div className="row  d-flex justify-content-center Feactures-border" >

                  <div className="Attendance Tracking text-start cards col-md-4 my-2 row">
                     <div className="col-md-3">

                        <img src={Calander} alt="calander " className="card-pick" />
                     </div>

                     <div className="col-md-9">

                        <h5>Device Calendar Integration</h5>
                        <p>
                           Seamlessly sync event schedules
                           with users’ device calendars.
                        </p>
                     </div>
                  </div>

                  <div className="Feedback and Ratings text-start cards col-md-4 my-2 row">
                     <div className="col-md-3">

                        <img src={Chat} alt=" chat" className="card-pick" />
                     </div>

                     <div className="col-md-9">

                        <h5>Interactive Chat</h5>
                        <p>
                           Groups Default chat groups for
                           teams, separate admin chat for
                           strategies.
                        </p>
                     </div>

                  </div>


                  <div className="Security and Privacy text-start cards col-md-4 my-2 row">
                     <div className="col-md-3">

                        <img src={user} alt="user" className="card-pick" />
                     </div>
                     <div className="col-md-9">

                        <h5>User-Friendly</h5>
                        <p>Interface Intuitive design for a
                           smooth user experience.</p>
                     </div>
                  </div>

               </div>

               <div className="row  d-flex justify-content-center Feactures-border" >

                  <div className="Attendance Tracking text-start cards col-md-4 my-2 row">
                     <div className="col-md-3">

                        <img src={personalized} alt="personalized " className="card-pick" />
                     </div>

                     <div className="col-md-9">

                        <h5>Personalization</h5>
                        <p>
                           Customize profiles, teams, and
                           preferences.
                        </p>
                     </div>
                  </div>

                  <div className="Feedback and Ratings text-start cards col-md-4 my-2 row">
                     <div className="col-md-3">

                        <img src={notification} alt=" notification" className="card-pick" />
                     </div>

                     <div className="col-md-9">

                        <h5>Notifications</h5>
                        <p>
                           Receive real-time updates about
                           events, news, and more.
                        </p>
                     </div>

                  </div>


                  <div className="Security and Privacy text-start cards col-md-4 my-2 row">
                     <div className="col-md-3">

                        <img src={Interactive} alt="interactive" className="card-pick" />
                     </div>
                     <div className="col-md-9">

                        <h5>Interactive Community</h5>
                        <p>Connect with players, coaches,
                           and enthusiasts.</p>
                     </div>
                  </div>

               </div>


               <div className="row  d-flex justify-content-center Feactures-border" >

                  <div className="Attendance Tracking text-start cards col-md-4 my-2 row">
                     <div className="col-md-3">

                        <img src={stories} alt="stories " className="card-pick" />
                     </div>

                     <div className="col-md-9">

                        <h5>Success Stories</h5>
                        <p>
                           Tracking progress through
                           continuous evaluation
                        </p>
                     </div>
                  </div>

                  <div className="Feedback and Ratings text-start cards col-md-4 my-2 row">
                     <div className="col-md-3">

                        <img src={app} alt=" app" className="card-pick" />
                     </div>

                     <div className="col-md-9">

                        <h5>Mobile App Compatibility</h5>
                        <p>
                           Available on iOS and Android devices.
                        </p>
                     </div>

                  </div>


                  <div className="Security and Privacy text-start cards col-md-4 my-2 row">
                     <div className="col-md-3">

                        <img src={support} alt="support" className="card-pick" />
                     </div>
                     <div className="col-md-9">

                        <h5>Support and Assistance</h5>
                        <p>Dedicated customer support for
                           user inquiries.</p>
                     </div>
                  </div>

               </div>

               <div className="row  d-flex justify-content-center Feactures-border" >

                  <div className="Attendance Tracking text-start cards col-md-4 my-2 row">
                     <div className="col-md-3">

                        <img src={tracking} alt="tracking " className="card-pick" />
                     </div>

                     <div className="col-md-9">

                        <h5>Transparency & Tracking</h5>
                        <p>
                           Clear view of planned sessions,
                           Track open sessions
                        </p>
                     </div>
                  </div>

                  <div className="Feedback and Ratings text-start cards col-md-4 my-2 row">
                     <div className="col-md-3">

                        <img src={coach} alt=" coach" className="card-pick" />
                     </div>

                     <div className="col-md-9">

                        <h5>Coach Profiles</h5>
                        <p>
                           Individual Coach Profiles to provide
                           clear visibility
                        </p>
                     </div>

                  </div>


                  <div className="Security and Privacy text-start cards col-md-4 my-2 row">
                     <div className="col-md-3">

                        <img src={share} alt="share" className="card-pick" />
                     </div>
                     <div className="col-md-9">

                        <h5>Social Sharing</h5>
                        <p>Share achievements and experiences
                           on social media.</p>
                     </div>
                  </div>

               </div>

            </div>
         </div>

         <Contact />
      </div>
   )
}

export default Features;