import React, { useState, useEffect } from 'react';
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css"; // Import the CSS file
import search from "../../assets/afterLogin picks/home/Search.png";
import axios from 'axios';
import { BaseUrl } from '../../reducers/Api/bassUrl';
import { useSelector } from 'react-redux';
import { updateProfile } from '../../reducers/authSlice';
import { useDispatch } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
// import { useAlert } from 'react-alert';


const Category = ({handleCloseSports}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sports, setSports] = useState([]);
    const token = useSelector(state => state.auth.user.data.user.token);
    const user = useSelector(state => state.auth.user);
    const chosenSports = useSelector(state => state.auth.user.data.user.chosenSports);
    const dispatch = useDispatch();
    // const alert = useAlert();

    // console.log("chosenSports", chosenSports);
// console.log("user data " , user);


    useEffect(() => {
        const SportList = BaseUrl();

        // Function to fetch sports data from API
        const fetchSports = async () => {
            try {
                const response = await axios.get(`${SportList}/user/sports/list`);
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

 


    // Function to handle sport selection
    const handleSportSelect = (sportId) => {
        const chosenSportIds = chosenSports.map(sport => sport._id);
        // Update selected state of the sport
        const updatedSports = sports.map(sport => {
            if (sport._id === sportId) { // Use `_id` as provided in your data structure
               
                if(chosenSportIds.includes(sport._id)){
                    // alert.show('This sport is already selected!');
                    toast.error('This sport is already selected!');
                    return sport;
                }

                return{
                    ...sport,
                    selected: !sport.selected
                }
            }
            return sport;
        });
        setSports(updatedSports); // Update sports state
    };

  

    // Function to filter and sort sports based on search query and selection state
    const filteredSports = Array.isArray(sports) ? sports
        .filter(sport => sport.sports_name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => b.selected - a.selected) : [];




    // update selected sports

    const updateSelectedSports = async (e) => {
        e.preventDefault();
    
        const selectedSports = sports.filter(sport => sport.selected).map(sport => sport._id);
        const updateURL = BaseUrl();
    
        try {
            const response = await axios.put(
                `${updateURL}/user/update/sports`,
                { chosenSports: selectedSports },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
    
            if (response.data.status === 200) {
                const updatedData = response.data.data.user.chosenSports;
    
                // Update user data with chosen sports
                const updatedUserData = {
                    ...user.data.user,
                    chosenSports: updatedData  // Assuming updatedData is an array of chosen sports
                };
                
                // Dispatch updateProfile action to update profile in Redux store
                dispatch(updateProfile(updatedUserData));
    
                toast.success('Sports updated successfully');
                handleCloseSports();
                window.location.reload();
            } else {
                const errorMessage = response.data.errors ? response.data.errors.msg : 'Error updating selected sports';
                toast.error(errorMessage);
                console.log("Error updating selected sports", response.data);
            }
        } catch (error) {
            console.error('Error updating selected sports:', error);
            toast.error('Internal server error while updating sports');
        }
    };
    

    return (
        <div className="ForgotPassword ">

            <div className="">
                <div className='container'>
                    <div className='text-center '>
                        <h3 className="mb-3">Select Your Favorite Sports</h3>
                    </div>

                    <ToastContainer />
                    <div className=''>
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
