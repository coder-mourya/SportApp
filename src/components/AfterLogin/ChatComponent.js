import React, { useEffect, useState } from 'react';
import filter from "../../assets/afterLogin picks/home/filter.png";
import { chats } from '../../assets/DummyData/dummyData';

const ChatComponent = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                // Simulate fetching data from the server
                // Replace this with your actual data fetching logic
                setUsers(chats);
            } catch (error) {
                console.log(error);
            }
        };

        fetchChats();

      
    }, []); // Empty dependencies array to run the effect only once

    return (
        <div className="container-fluid mt-5 ">
            <div className='itemsColor p-4 rounded-4'>
                {/* First line: Heading and filter icon */}
                <div className="row align-items-center mb-3">
                    <div className="col">
                        <h6 className="mb-0">
                            All messages
                        </h6>
                    </div>
                    <div className="col-auto">
                        <img src={filter} alt="filter" className='filter' />
                    </div>
                </div>
                {/* Second line: Search input */}
                <div className="row">
                    <div className="col search">
                        <input
                            type="text"
                            className="form-control my-2"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                {/* Third line: Users */}
                <div className="row">
                    <div className="col">
                        {users.map((user) => (
                            <div key={user.id} className="mb-3 d-flex align-items-center media">
                                <img
                                    src={user.image}
                                    className="mr-4 rounded-circle "
                                    alt={user.name}
                                />
                                <div className='media-text pt-2'>
                                    <h5 className="my-0">{user.name}</h5>
                                    <p>{user.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ChatComponent;
