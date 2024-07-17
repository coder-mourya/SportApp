import {createSlice , createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import { BaseUrl } from './Api/bassUrl';


export const fetchEvents = createAsyncThunk(`events/fetchEvents`, async (token) =>{
    const eventUrl = BaseUrl();
    const response = await axios.get(`${eventUrl}/user/event/list`, {
        headers : {
            Authorization : `Bearer ${token}`
        }
    });
    return response.data.data.eventData.eventList;
});

export const eventSlice = createSlice({
    name : 'events',
    initialState : {
        events : [],
        status : 'idle',
        error : null
    },
    reducers : {
        addEvent : (state, action) => {
            state.events.push(action.payload);
        }
    },
    extraReducers : (builder) => {
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
    }
})


export const {addEvent} = eventSlice.actions;

export default eventSlice.reducer;
