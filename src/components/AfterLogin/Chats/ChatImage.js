import React, { useState } from 'react';

const ChatImage = ({ image }) => {
    const [isOpen, setIsOpen] = useState(false);

    // console.log("image in image chat", image);
    

    const handleImageClick = () => {
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <div>
            {/* Thumbnail */}
            <img
                src={image.link}
                alt={image.name}
                style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    objectFit: 'cover',
                }}
                onClick={handleImageClick}
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
                    <img
                        src={image.link}
                        alt={image.name}
                        style={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            borderRadius: '8px',
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ChatImage;
