import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BaseUrl } from './Api/bassUrl';
import { logout } from './authSlice';



export const fetchEvents = createAsyncThunk(`events/fetchEvents`, async (token, { dispatch }) => {
    const eventUrl = BaseUrl();
    const response = await axios.get(`${eventUrl}/user/event/list`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (response.data.status === 401) {
        dispatch(logout());
        return Promise.reject(new Error('Unauthorized'));
    }

    return response.data.data.eventData.eventList;
});

export const fetchEventsDetails = createAsyncThunk(`events/fetchEventsDetails`,

    async ({ eventId, token}, { dispatch }) => {
        // console.log("event id ", eventId);
        const eventDetailsUrl = BaseUrl();
        const response = await axios.get(`${eventDetailsUrl}/user/event/details/${eventId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.data.status === 401) {
            dispatch(logout());
            return Promise.reject(new Error('Unauthorized'));
        }
        // console.log("event details ", response.data.data);
        return response.data.data.eventDetails;
    });

export const eventSlice = createSlice({
    name: 'events',
    initialState: {
        events: [],
        eventDetails: null,
        status: 'idle',
        error: null
    },
    reducers: {
        addEvent: (state, action) => {
            state.events.push(action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEvents.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchEvents.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.events = action.payload;
            })
            .addCase(fetchEvents.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })


            //  extra reducers for fetchEventsDetails
            .addCase(fetchEventsDetails.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchEventsDetails.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.eventDetails = action.payload;
            })
            .addCase(fetchEventsDetails.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
    }
})


export const { addEvent } = eventSlice.actions;

export default eventSlice.reducer;
