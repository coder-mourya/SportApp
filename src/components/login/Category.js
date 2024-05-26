import React, { useState, useEffect } from 'react';
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css"; // Import the CSS file
import search from "../../assets/afterLogin picks/Sports category icons/Search.png";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { BaseUrl } from '../../reducers/Api/bassUrl';
import Alerts from '../Alerts';
import { useSelector } from 'react-redux';

const Category = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sports, setSports] = useState([]);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');
    const token = useSelector(state => state.auth.user.data.user.token);
    const chosenSports = useSelector(state => state.auth.user.data.user.chosenSports);

console.log("chosenSports",chosenSports);



    useEffect(() => {
        const SportList = BaseUrl();

        // Function to fetch sports data from API
        const fetchSports = async () => {
            try {
                const response = await axios.get(`${SportList}/api/v1/user/sports/list`);
                const sportsList = response.data.data.sports_list;

                if (Array.isArray(chosenSports)) {
                    const chosenSportIds = chosenSports.map(sport => sport._id);
                    const updatedSports = sportsList.map(sport => ({
                        ...sport,
                        selected: chosenSportIds.includes(sport._id)
                    }));

                    setSports(updatedSports);
                } else {
                    setSports(sportsList);
                }

            } catch (error) {
                console.error('Error fetching sports data:', error);
            }
        };

        // Fetch sports data when component mounts
        fetchSports();
    }, [chosenSports]); // Empty dependency array to run only once

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



    // update selected sports

    const updateSelectedSports = async (e) => {
        e.preventDefault();

        const selectedSports = sports.filter(sport => sport.selected).map(sport => sport._id);
        const updateURL = BaseUrl();

        try {
            const response = await axios.put(`${updateURL}/api/v1/user/update/sports`, {
                chosenSports: selectedSports
            },
            
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            if (response.data.status === 200) {
                console.log("ports updated ", response.data);
                setAlertMessage('Sports updated successfully');
                setAlertType('success');
                const navigateDelay = () => navigate('/loggedInHome');
                setTimeout(navigateDelay, 1000);
            } else {
                const errorMessage = response.data.errors ? response.data.errors.msg : 'Error updating selected sports';
                setAlertMessage(errorMessage);
                setAlertType('error');
                console.log("Error updating selected sports", response.data);
            }
        } catch (error) {
            console.error('Error updating selected sports:', error);
        }
    }

    return (
        <div className="ForgotPassword container-fluid ">
            <div className="blur-background" onClick={handleClose}></div>
            <div className="container-right">
                <div className='container'>
                    <div className='text-center mt-4'>
                        <h3 className="mb-2">Select Your Favorite Sports</h3>
                    </div>

                    {alertMessage && <Alerts message={alertMessage} type={alertType} />}
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
                            <button type="submit" className="btn btn-danger py-2 login-botton mt-4" onClick={updateSelectedSports}>Done</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Category;
