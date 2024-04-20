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
import Pending from "./components/login/PendingMail";
import Category from "./components/login/Category";
import LoggedInHome from "./pages/AfterLogin/LoggedInHome";
import FAQPage from "./pages/FAQPage";
import ContactPage from "./pages/ContactPage";
import ComingSoon from "./components/ComingSoon";
import CreateTeam from "./pages/AfterLogin/CreateTeam";
import ChatBox from './components/AfterLogin/ChatBox';
import Create from './components/AfterLogin/CreateTeam/Create';


function App() {


  const location = useLocation();
  const isRoute = location.pathname === "/ComingSoon" || location.pathname === '/LoggedInHome' || location.pathname === '/CreateTeam';

  return (
    <>
      <Navbar />

      <Routes>
        {/* page Routes */}
        <Route exact path='/' element={<Home />} />
        <Route exact path='/About' element={<About />} />
        <Route exact path='/Features' element={<Features />} />
        <Route exact path='/FAQ' element={<FAQ />} />
        <Route exact path='/Chart' element={<Chart />} />
        <Route exact path='/Contact-us' element={<Contact />} />
        <Route exact path='/FAQPage'  element={<FAQPage />} />
        <Route exact path='/ContactPage' element={<ContactPage />} />

        {/* Login routes */}
        <Route exact path='/login' element={<LoginForm />} />
        <Route exact path='/ForgotPassword' element={<ForgotPassword />} />
        <Route exact path='/PassRecovery' element={<PassRecovery />} />
        <Route exact path='/Register' element={<Register />} />
        <Route exact path='/VerifyMail' element={<VerifyMail />} />
        <Route exact path='/Pending' element={<Pending />} />
        <Route exact path="/Category" element={<Category />} />

        {/* LoggedIn Routes */}

        <Route exact path='/LoggedInHome'  element={<LoggedInHome />} />
        <Route exact path='/CreateTeam' element={<CreateTeam />} />
        <Route exact path='/Create' element={<Create />} />

        {/* temprary routes */}
        <Route exact path='/ComingSoon' element={<ComingSoon />} />

      </Routes>
      {isRoute && <ChatBox />}

      {/* {!isLoginRoute && <Footer />} */}
      
      {!isRoute && <Footer />}
    </>
  );
}

export default App;
