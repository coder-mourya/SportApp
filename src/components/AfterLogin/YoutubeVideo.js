import React from 'react';
import video from "../../assets/afterLogin picks/home/video.png";
import "../../assets/Styles/AfterLogin/loggedInHome.css";

const YoutubeVideo = () => {





    return (
        <div className="container-fluid mt-4 videos-container">
            <div className='itemsColor p-4 rounded-4'>
                {/* First line: Heading and filter icon */}
                <div className="row align-items-center mb-3">
                    <div className="col">
                        <h5 className="mb-0">
                            Youtube videos
                        </h5>
                    </div>
                    <div className="col-auto">
                        <a href="https://www.youtube.com/channel/UCBVVZt2pw9W2MsCdHHTIbOg" rel='noreferrer' target='_blank'><button className='btn btn-danger'>Subscribe</button></a>
                    </div>
                </div>
                {/* Second line: Search input */}

                {/* Third line: Users */}

                <a href="https://www.youtube.com/watch?v=4KYZ5iPIN4c" target='_blank' rel='noreferrer' style={{textDecoration:"none"}}>

                    <div className='row mb-3'>
                        <div className='col-md-4 d-flex justify-content-center align-items-center'>
                            <div
                                className='icon-container'

                            >
                                <img
                                    src={video}
                                    alt="video"

                                />
                            </div>
                        </div>
                        <div className='col-md-8 d-flex align-items-center text-start p-0'>
                            <h4 className='title'>Team Expenses...</h4>
                        </div>
                    </div>
                </a>

                <hr />

                <a href="https://www.youtube.com/watch?v=dXj-whZe4Tc" target='_blank' rel='noreferrer' style={{textDecoration:"none"}}>

                    <div className='row mb-3'>
                        <div className='col-md-4 d-flex justify-content-center align-items-center'>
                            <div
                                className='icon-container'

                            >
                                <img
                                    src={video}
                                    alt="video"

                                />
                            </div>
                        </div>
                        <div className='col-md-8 d-flex align-items-center text-start p-0'>
                            <h4 className='title'>Create Your Team...</h4>
                        </div>
                    </div>
                </a>

                <hr />

            </div>
        </div>
    );
};

export default YoutubeVideo;
