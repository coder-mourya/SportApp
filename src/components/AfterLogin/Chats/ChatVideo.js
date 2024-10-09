import React, { useState } from 'react';

const ChatVideo = ({ video }) => {
    const [isOpen, setIsOpen] = useState(false);

    // console.log("video in video chat", video);
    

    const handleVideoClick = () => {
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <div style={{ margin: '8px 0' }}>
            {/* Video Thumbnail */}
            <video
                src={video?.link}
                alt={video?.name}
                style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    objectFit: 'cover',
                }}
                onClick={handleVideoClick}
                controls={false}
            />

            {/* Full-screen Modal */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                    }}
                    onClick={handleClose}
                >
                    <video
                        src={video?.link}
                        alt={video?.name}
                        style={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            borderRadius: '8px',
                        }}
                        controls
                        autoPlay
                    />
                </div>
            )}
        </div>
    );
};

export default ChatVideo;
