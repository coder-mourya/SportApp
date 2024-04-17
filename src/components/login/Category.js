import React, { useState, useEffect } from 'react';
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css"; // Import the CSS file
import { category } from "../../assets/DummyData/dummyData";
import search from "../../assets/afterLogin picks/Sports category icons/Search.png";
import {useNavigate} from "react-router-dom";


const Category = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sports, setSports] = useState([]);

    useEffect(() => {
        // Function to fetch sports data from API
        const fetchSports = async () => {
            try {
                setSports(category); // Update state with fetched sports data
            } catch (error) {
                console.error('Error fetching sports data:', error);
            }
        };

        // Fetch sports data when component mounts
        fetchSports();
    }, []); // Empty dependency array to run only once

    const Navigate = useNavigate();
    const handleClose = () =>{
        Navigate("/")
    }

    // Function to handle sport selection
    const handleSportSelect = (sportId) => {
        // Update selected state of the sport
        const updatedSports = sports.map(sport => {
            if (sport.id === sportId) {
                return {
                    ...sport,
                    selected: !sport.selected // Toggle selected state
                };
            }
            return sport;
        });
        setSports(updatedSports); // Update sports state

        
    };

    // Function to filter sports based on search query
    const filteredSports = sports.filter(sport =>
        sport.sport.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="ForgotPassword container-fluid ">
            <div className="blur-background" onClick={handleClose}></div>
            <div className="container-right">
                <div className='container'>
                    <div className='text-center mt-4'>
                        <h3 className="mb-2">Select Your Favorite Sports</h3>
                    </div>
                    <div className='p-md-4'>
                        {/* Search bar */}
                        <form>
                            <div className='input-group my-1'>
                                <span className="input-group-text">
                                    <img src={search} alt="search" />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search your  sports..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="form-control"
                                />
                            </div>
                            {/* Render list of sports */}
                            <div className="sports-list row mt-4 ">
                                {filteredSports.map((sport, index) => (
                                    <div key={index} className={`sport-item col-4 text-center pt-2 rounded-3 border ${sport.selected ? "selected" : ""}`} onClick={() => handleSportSelect(sport.id)}>
                                        <img src={sport.image} alt={sport.name} className={sport.selected ? "selected" : ""} />
                                        <p>{sport.sport}</p>
                                    </div>
                                ))}
                            </div>
                            <button type="submit" className="btn btn-danger py-3 login-botton mt-4">Done</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Category;
