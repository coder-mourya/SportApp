import React, { useState } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import docIcon from "../../../assets/afterLogin picks/events/doc-icon.svg";



const getFileTypeFromName = (fileName) => {
    const fileExtension = fileName.split('.').pop().toLowerCase();
    return fileExtension;
};

const ChatDocs = ({ document }) => {
    const fileType = getFileTypeFromName(document.name);
    const [isOpen, setIsOpen] = useState(false);

    const handleDocumentClick = () => {
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <div>
            <div
                onClick={handleDocumentClick}
                style={{
                    width: '100%',
                    height: '30px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                }}
            >
                <img src={docIcon} alt='document' style={{ width: '24px', height: '24px', marginRight: '8px' }} />
                <p className='p-0 m-0'>{document.name}</p>
            </div>

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
                    <div
                        style={{
                            width: '80%',
                            height: '80%',
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            overflow: 'hidden',
                        }}
                    >
                        {fileType === 'pdf' ? (
                            <Worker workerUrl='https://unpkg.com/pdfjs-dist@latest/build/pdf.worker.min.js'>

                                <Viewer fileUrl={document.link} />
                            </Worker>

                        ) : (
                            <p>Unsupported file type.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatDocs;
