import './App.css';
import Home from './pages/Home';
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from './components/Navbar';
import About from "./pages/About"
import Features from './pages/App-features';
import FAQ from './components/FAQ';
import Chart from './pages/SizeChart';
import Contact from './components/Contact';
import Footer from './components/Footer';
import LoginForm from './components/login/Login';
import ForgotPassword from "./components/login/ForgotPass";
import PassRecovery from "./components/login/PassRecovery";
import Register from "./components/login/Register";
import VerifyMail from "./components/login/VerifyMail";
import PendingMail from "./components/login/PendingMail";
import Category from "./components/login/Category";
import LoggedInHome from "./pages/AfterLogin/LoggedInHome";
import FAQPage from "./pages/FAQPage";
import ContactPage from "./pages/ContactPage";
import ComingSoon from "./components/ComingSoon";
import CreateTeam from "./pages/AfterLogin/CreateTeam";
// import ChatBox from './components/AfterLogin/ChatBox';
import Create from './components/AfterLogin/CreateTeam/Create';
import AddMember from './components/AfterLogin/CreateTeam/AddMember';
import TeamDashbord from './pages/AfterLogin/TeamDashBord';
import MemberDashBord from './pages/AfterLogin/MemberDashBord';
import FamilyDashBord from './pages/AfterLogin/FamilyDashBord';
import TrainingDashBord from './pages/AfterLogin/TrainingDashBord';
import EventDashBord from './pages/AfterLogin/EventDashBord';
import CreatePracticeForm from './components/AfterLogin/CreatePractice/CreatePracticeForm';
import AddMemberAndTeam from './components/AfterLogin/CreatePractice/AddMemberAndTeam';
import EventDetails from './pages/AfterLogin/EventsDetails';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ProtectedRoute2 } from './components/ProtectedRoute';
import ViewProfile from './components/AfterLogin/ViewProfile';
import ChangePass from './components/AfterLogin/ChangePass';
import AddFamilyMember from './components/AfterLogin/CreateTeam/AddFamilyMember';
import TearmsAndConditions from './components/Tearms-conditions';
import Policy from './components/Policy';
import Cookies from './components/Cookies';
import JoinTeam from './components/AfterLogin/CreateTeam/JoinTeam';
import { useState } from 'react';
import CreateGame from './components/AfterLogin/CreatePractice/CreateGame';
import CreateTournament from './components/AfterLogin/CreatePractice/CreateTournament';
import JoinEvent from './components/AfterLogin/Events/JoinEvent';
import Schedule from './pages/AfterLogin/Schedule';
import All from './components/AfterLogin/Schedule/All';
import EventSchedule from './components/AfterLogin/Schedule/EventSchedule';
import TrainingSchedule from './components/AfterLogin/Schedule/TrainingSchedule';
import Payment from './components/AfterLogin/Events/Payment';
import PaymentStatus from './components/AfterLogin/Events/PaymentStatus';
import ChatsScreenDashBord from './pages/AfterLogin/ChatsScreenDashBord';
import EventChats from './components/AfterLogin/Chats/EventChats';
import TrainingList from './components/AfterLogin/Trainings/Training-list';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

function App() {


  const location = useLocation();
  const isRoute = location.pathname === "/ComingSoon" || location.pathname === '/LoggedInHome' || location.pathname === '/CreateTeam' || location.pathname === "/TeamDashbord" || location.pathname === "/MemberDashBord" || location.pathname === '/FamilyDashBord' || location.pathname === '/TrainingDashBord' || location.pathname === '/EventDashBord' || location.pathname === '/CreatePracticeForm' || location.pathname === '/EventDetails' || location.pathname === '/ViewProfile' || location.pathname === '/ChangePass'  || location.pathname === '/CreateGame' || location.pathname === '/CreateTournament' || location.pathname === '/schedule' || location.pathname === '/All' || location.pathname === '/EventSchedule' || location.pathname === '/TrainingSchedule' || location.pathname === '/chatScreen' || location.pathname === '/trainingDashBord' || location.pathname === '/training-list';

  const [showLogin, setShowLogin] = useState(false);



  return (

    <>




      <Navbar showLogin={showLogin} setShowLogin={setShowLogin} />

      {/* <ToastContainer /> */}
      <Routes>
        <Route exact path='/' element={<ProtectedRoute2 element={Home} />} />
        {/* pages Routes */}
        <Route exact path='/About' element={<About />} />
        <Route exact path='/Features' element={<Features />} />
        <Route exact path='/faq/' element={<FAQ />} />
        <Route exact path='/size-chart/' element={<Chart />} />
        <Route exact path='/Contact-us' element={<Contact />} />
        <Route exact path='/FAQPage' element={<FAQPage />} />
        <Route exact path='/ContactPage' element={<ContactPage />} />
        <Route exact path='/terms-and-conditions/' element={<TearmsAndConditions />} />
        <Route exact path="/privacy-policy/" element={<Policy />} />
        <Route exact path="/cookies-policy/" element={<Cookies />} />
        <Route exact path="/join-team/:teamId" element={<JoinTeam showLogin={showLogin} setShowLogin={setShowLogin} />} />
        <Route exact path="/join-event/:eventId" element={<JoinEvent showLogin={showLogin} setShowLogin={setShowLogin} />} />



        {/* Login routes */}
        <Route exact path='/login' element={<LoginForm />} />
        <Route exact path='/ForgotPassword' element={<ForgotPassword />} />
        <Route exact path='/PassRecovery' element={<PassRecovery />} />
        <Route exact path='/Register' element={<Register />} />
        <Route exact path='/VerifyMail' element={<VerifyMail />} />
        <Route exact path='/PendingMail' element={<PendingMail />} />
        <Route exact path="/Category" element={<Category />} />

        {/* LoggedIn Routes */}
        <Route exact path='/LoggedInHome' element={<ProtectedRoute element={LoggedInHome} />} />
        <Route exact path='/CreateTeam' element={<ProtectedRoute element={CreateTeam} />} />
        <Route exact path='/Create' element={<ProtectedRoute element={Create} />} />
        <Route exact path='/AddMember' element={<ProtectedRoute element={AddMember} />} />
        <Route exact path='/AddFamilyMember' element={<ProtectedRoute element={AddFamilyMember} />} />
        <Route exact path='/TeamDashbord' element={<ProtectedRoute element={TeamDashbord} />} />
        <Route exact path='/MemberDashBord' element={<ProtectedRoute element={MemberDashBord} />} />
        <Route exact path='/FamilyDashBord' element={<ProtectedRoute element={FamilyDashBord} />} />
        <Route exact path='/trainingDashBord' element={<ProtectedRoute element={TrainingDashBord} />} />
        <Route exact path='/EventDashBord' element={<ProtectedRoute element={EventDashBord} />} />
        <Route exact path='/CreatePracticeForm' element={<ProtectedRoute element={CreatePracticeForm} />} />
        <Route exact path='/CreateGame' element={<ProtectedRoute element={CreateGame} />} />
        <Route exact path='/CreateTournament' element={<ProtectedRoute element={CreateTournament} />} />
        <Route exact path='/AddMemberAndTeam' element={<ProtectedRoute element={AddMemberAndTeam} />} />
        <Route exact path='/EventDetails' element={<ProtectedRoute element={EventDetails} />} />
        <Route exact path='/ViewProfile' element={<ProtectedRoute element={ViewProfile} />} />
        <Route exact path='/ChangePass' element={<ProtectedRoute element={ChangePass} />} />
        <Route exact path='/schedule' element={<ProtectedRoute element={Schedule} />} />
        <Route exact path='/all-schedule'  element={<ProtectedRoute element={All} />} />
        <Route exact path='/event-schedule'  element={<ProtectedRoute element={EventSchedule} />} />
        <Route exact path='/training-schedule'  element={<ProtectedRoute element={TrainingSchedule} />} />
        <Route exact path='/payment'  element={<ProtectedRoute element={Payment} />} />
        <Route exact path='/payment-status' element={<ProtectedRoute element={PaymentStatus} />} />
        <Route exact path='/chatScreen' element={<ProtectedRoute element={ChatsScreenDashBord} />} />
        <Route exact path='/eventChat' element={<ProtectedRoute element={EventChats} />} />

        <Route exact path='/training-list' element={<ProtectedRoute element={TrainingList} />} />
        {/* <Route exact path='/chat' element={<ChatBox element={ChatBox} />} /> */}

        




        {/* temprary routes */}
        <Route exact path='/ComingSoon' element={<ComingSoon />} />

      </Routes>
      {/* {isRoute && <ChatBox />} */}


      {!isRoute && <Footer />}


    </>

  );
}

export default App;
