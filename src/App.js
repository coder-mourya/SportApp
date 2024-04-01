
import './App.css';
import Home from './pages/Home';
import {Routes , Route } from "react-router-dom";
import Navbar from './components/Navbar';
import About from './components/About';
import Features from './components/App-features';
import FAQ from './components/FAQ';
import Chart from './components/SizeChart';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
   <>
   <Navbar/>
   
   <Routes>

    <Route exact path='/'  element={<Home/>} />
    <Route exact path='/About' element={<About />} />
    <Route exact path='/Features' element ={<Features />} />
    <Route exact path='/FAQ' element ={<FAQ />} />
    <Route exact path='/Chart' element ={<Chart />} />
    <Route exact path='/Contact-us' element ={<Contact />} />

   </Routes>
  <Footer />
   </>
  );
}

export default App;
