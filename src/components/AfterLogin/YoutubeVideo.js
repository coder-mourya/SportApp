import React from 'react';
import Youtube from "../../assets/afterLogin picks/My team/youtube.svg"

const YoutubeVideo = () => {





    return (
        <div className="container-fluid mt-5 ">
            <div className='itemsColor p-4 rounded-4'>
                {/* First line: Heading and filter icon */}
                <div className="row align-items-center mb-3">
                    <div className="col">
                        <h5 className="mb-0">
                            Youtube videos
                        </h5>
                    </div>
                    <div className="col-auto">
                        <button className='btn btn-danger'>Subscribe</button>
                    </div>
                </div>
                {/* Second line: Search input */}

                {/* Third line: Users */}
                <div className="row">
                    <div className="col">

                        <div className="mb-3 d-flex flex-column align-items-center videos">
                            <img
                                src={Youtube}
                                className="mr-4 "
                                alt="YoutubeVideo"
                            />

                            <img
                                src={Youtube}
                                className="mr-4  "
                                alt="YoutubeVideo"
                            /> 
                            <img
                                src={Youtube}
                                className="mr-4  "
                                alt="YoutubeVideo"
                            /> 
                            <img
                                src={Youtube}
                                className="mr-4  "
                                alt="YoutubeVideo"
                            /> 
                            <img
                                src={Youtube}
                                className="mr-4  "
                                alt="YoutubeVideo"
                            />

                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default YoutubeVideo;
