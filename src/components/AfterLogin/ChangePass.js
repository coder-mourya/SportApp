import React, {  useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/Styles/AfterLogin/loggedInHome.css";
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css";
import Sidebar from "../../components/AfterLogin/Sidebar";
import SidebarSmallDevice from "../../components/AfterLogin/SidebarSmallDevice";
import arrow from "../../assets/afterLogin picks/My team/arrow.svg";
import password from "../../assets/afterLogin picks/password.png";
import { BaseUrl } from "../../reducers/Api/bassUrl";
import axios from "axios";
import { useSelector } from "react-redux";
import Alerts from "../Alerts";

const ChangePass = () => {
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [mainContainerClass, setMainContainerClass] = useState("col-md-11");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const token = useSelector(state => state.auth.user.data.user.token);
       
//   const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    

// if(isLoggedIn){
//     console.log(token);
// }


    const navigate = useNavigate();

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
        setMainContainerClass(sidebarOpen ? "col-md-11" : "col-md-10");
    };

    const handleCrose = () => {
        navigate("/ViewProfile");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

  


    const HandleSubmit = async (e) => {
        e.preventDefault();

        if(formData.password !== formData.confirmPassword){
            setPasswordError('new password and confirm password does not match');
            return;

        }else{
            setPasswordError('')
        }

        const changePasswordUrl = BaseUrl();

        try {
            const response = await axios.post(`${changePasswordUrl}/api/v1/user/change/password`,
                {
                    oldPassword : formData.oldPassword,
                    newPassword : formData.newPassword,
                    confirmPassword : formData.confirmPassword
                },

                {
                    headers: {
                        'Authorization' : `Bearer ${token}`
                    }
                });

            if (response.data.status === 200) {
                console.log(response.data);
                setAlertMessage('Password changed successfully');
                setAlertType('success');
                
                const naviGateDelay = () =>{
                    navigate("/ViewProfile");
                }

                setTimeout(naviGateDelay, 2000);

            } else {
                const errorMessage = response.data  ? response.data.message : 'Error changing password';
                console.error('Error registering user:', response.data);
                
                setAlertMessage(errorMessage);
                setAlertType('error');
            }
        } catch (error) {
            setAlertMessage('internal server error');
            setAlertType('error');
        }
    };

    return (
        <div className="container-fluid bodyColor">
            <div className="row">
                <div className="col">
                    <Sidebar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                    <SidebarSmallDevice />
                </div>
                <div className={`${mainContainerClass} main mt-5`}>
                    <div className="profile-container">
                        <div className="d-flex justify-content-between">
                            <div className="d-flex">
                                <button className="btn prev-button" onClick={handleCrose}>
                                    <img src={arrow} alt="previous" />
                                </button>
                                <h4 className="ms-3 mt-md-1">Change password</h4>
                            </div>
                        </div>

                        <div className="changePassword itemsColor my-4 rounded-4 row p-4">
                            <div className="col-md-4">
                                <form className="form" onSubmit={HandleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="oldPassword" className="form-label">Old password</label>
                                        <div className="input-group my-1">
                                            <span className="input-group-text">
                                                <img src={password} alt="password" />
                                            </span>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="oldPassword"
                                                name="oldPassword"
                                                placeholder="Enter your old password"
                                                value={formData.oldPassword}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="newPassword" className="form-label">New password</label>
                                        <div className="input-group my-1">
                                            <span className="input-group-text">
                                                <img src={password} alt="password" />
                                            </span>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="newPassword"
                                                name="newPassword"
                                                placeholder="Enter your new password"
                                                value={formData.newPassword}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="confirmPassword" className="form-label">Confirm New password</label>
                                        <div className="input-group my-1">
                                            <span className="input-group-text">
                                                <img src={password} alt="password" />
                                            </span>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                placeholder="Re-enter your new password"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    {passwordError && <div className="text-danger">{passwordError}</div>}
                                    
                                    <div className="password-change mt-2">
                                        <button type="submit" className="btn btn-danger">Update</button>
                                    </div>
                                </form>

                                {alertMessage && <Alerts message={alertMessage} type={alertType} />}
                               
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePass;
