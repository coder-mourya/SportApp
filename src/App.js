import './App.css';
import Home from './pages/Home';
import { Routes, Route } from "react-router-dom";
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


function App() {
  // const location = useLocation();
  // const isLoginRoute = location.pathname === '/login' || location.pathname === '/ForgotPassword' || location.pathname === '/PassRecovery' || location.pathname === '/Register' || location.pathname === '/VerifyMail' || location.pathname === '/Pending';

  return (
    <>
      <Navbar />

      <Routes>
        
        <Route exact path='/' element={<Home />} />
        <Route exact path='/About' element={<About />} />
        <Route exact path='/Features' element={<Features />} />
        <Route exact path='/FAQ' element={<FAQ />} />
        <Route exact path='/Chart' element={<Chart />} />
        <Route exact path='/Contact-us' element={<Contact />} />

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
      </Routes>

      {/* {!isLoginRoute && <Footer />} */}
      <Footer />
    </>
  );
}

export default App;
