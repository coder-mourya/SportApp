import React, { useState, useEffect } from 'react';
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css"; // Import the CSS file
import search from "../../assets/afterLogin picks/Sports category icons/Search.png";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { BaseUrl } from '../../reducers/Api/bassUrl';

const Category = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sports, setSports] = useState([]);

    useEffect(() => {
        const SportList = BaseUrl();

        // Function to fetch sports data from API
        const fetchSports = async () => {
            try {
                const response = await axios.get(`${SportList}/api/v1/user/sports/list`);
                setSports(response.data.data.sports_list); // Update state with fetched sports data
                console.log(response.data.data);
            } catch (error) {
                console.error('Error fetching sports data:', error);
            }
        };

        // Fetch sports data when component mounts
        fetchSports();
    }, []); // Empty dependency array to run only once

    const navigate = useNavigate();
    const handleClose = () => {
        navigate("/");
    };

    // Function to handle sport selection
    const handleSportSelect = (sportId) => {
        // Update selected state of the sport
        const updatedSports = sports.map(sport => {
            if (sport._id === sportId) { // Use `_id` as provided in your data structure
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
    const filteredSports = Array.isArray(sports) ? sports.filter(sport =>
        sport.sports_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

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
                                    placeholder="Search your sports..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="form-control"
                                />
                            </div>
                            {/* Render list of sports */}
                            <div className="sports-list row mt-4 ">
                                {filteredSports.map((sport, index) => (
                                    <div key={index} className={`sport-item col-4 text-center pt-2 rounded-4 border ${sport.selected ? "selected" : ""}`} onClick={() => handleSportSelect(sport._id)}>
                                         <img src={sport.selected ? sport.selected_image : sport.image} alt={sport.sports_name} className={sport.selected ? "selected" : ""} />
                                        
                                        <p>{sport.sports_name}</p>
                                    </div>
                                ))}
                            </div>
                            <button type="submit" className="btn btn-danger py-2 login-botton mt-4">Done</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Category;
