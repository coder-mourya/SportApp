import React from 'react';
import "../../assets/Styles/AfterLogin/Full-LoginProcess.css"; 
import password from "../../assets/afterLogin picks/password.png"
import mail from "../../assets/afterLogin picks/mail.png";
import name from "../../assets/afterLogin picks/name.png";
import nickname from "../../assets/afterLogin picks/name.png";
import mobile from "../../assets/afterLogin picks/mobile.png";
import dob from "../../assets/afterLogin picks/dob.png";
// import gender from "../../assets/afterLogin picks/name.png";


const Register = () => {
    return (
        <div className="Create-account container-fluid ">
            <div className="blur-background"></div>
            <div className="container-right">
                <div className='container account_info'>
                    <div className='cotainer mt-3'>
                        <h3 className="mb-3">Create an account</h3>
                    </div>
                    <div className='p-md-4'>
                        <form>
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">Name</label>
                                <div className="input-group my-1">
                                    <span className="input-group-text">
                                        <img src={name} alt="name" />
                                    </span>
                                    <input type="text" className="form-control" id="name" placeholder="Enter your name" />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="nickname" className="form-label">Nickname</label>
                                <div className="input-group my-1">
                                    <span className="input-group-text">
                                        <img src={nickname} alt="nickname" />
                                    </span>
                                    <input type="text" className="form-control" id="nickname" placeholder="Enter your nickname" />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email Address</label>
                                <div className="input-group my-1">
                                    <span className="input-group-text">
                                        <img src={mail} alt="email" />
                                    </span>
                                    <input type="email" className="form-control" id="email" placeholder="Enter your email address" />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="mobile" className="form-label">Mobile Number</label>
                                <div className="input-group my-1">
                                    <span className="input-group-text">
                                        <img src={mobile} alt="mobile" />
                                    </span>
                                    <input type="text" className="form-control" id="mobile" placeholder="Enter your mobile number" />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="dob" className="form-label">Date of Birth</label>
                                <div className="input-group my-1">
                                    <span className="input-group-text">
                                        <img src={dob} alt="dob" />
                                    </span>
                                    <input type="date" className="form-control" id="dob" />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="gender" className="form-label">Gender</label>
                                <div className="input-group my-1">
                                    {/* <span className="input-group-text">
                                        <img src={gender} alt="gender" />
                                    </span> */}
                                    <select className="form-select " id="gender">
                                        <option>Select gender</option>
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Password</label>
                                <div className="input-group my-1">
                                    <span className="input-group-text">
                                        <img src={password} alt="password" />
                                    </span>
                                    <input type="password" className="form-control" id="password" placeholder="Enter your password" />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="country" className="form-label">Country</label>
                                <div className="input-group my-1">
                                   
                                    <select className="form-select" id="country">
                                        <option>Select country</option>
                                        {/* Add options for countries */}
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="state" className="form-label">State</label>
                                <div className="input-group my-1">
                                   
                                    <select className="form-select" id="state">
                                        <option>Select state</option>
                                        {/* Add options for states */}
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="city" className="form-label">City</label>
                                <div className="input-group my-1">
                                   
                                    <select className="form-select" id="city">
                                        <option>Select city</option>
                                        {/* Add options for cities */}
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3 form-check">
                                <input type="checkbox" className="form-check-input" id="terms" />
                                <label className="form-check-label" htmlFor="terms">I agree to the terms and conditions</label>
                            </div>
                            <button type="submit" className="btn btn-danger py-3 login-botton mt-4">Create an account</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
