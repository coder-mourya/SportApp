import React, { useState, useEffect } from 'react';

const ChatMap = ({ map }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleMapClick = () => {
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    // This effect initializes the map when the modal opens
    useEffect(() => {
        if (isOpen) {
            const mapOptions = {
                center: { lat: parseFloat(map.latitude), lng: parseFloat(map.longitude) },
                zoom: 15,
            };
            new window.google.maps.Map(document.getElementById('map'), mapOptions);
        }
    }, [isOpen, map.latitude, map.longitude]);

    return (
        <div>

            {/* Map Thumbnail */}
            <div
                style={{
                    width: '200px',
                    height: '200px',
                    backgroundColor: '#d3d3d3',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundImage: `url("https://maps.googleapis.com/maps/api/staticmap?center=${map.latitude},${map.longitude}&zoom=15&size=600x300&key=AIzaSyA6UfWsoXt63QDE3phm0W1XMRBiO2xrUzo&libraries")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
                onClick={handleMapClick}
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

                >



                    <div
                        id="map"
                        style={{
                            width: '90%',
                            height: '90%',
                            borderRadius: '8px',
                            backgroundColor: '#ffffff',
                        }}
                    />
                    <div className='d-flex align-items-start'>
                        <button className='btn' onClick={handleClose}><i class="fa-solid fa-x text-white"></i></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatMap;
