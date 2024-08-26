import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BaseUrl } from './Api/bassUrl';
import { logout } from './authSlice';




export const fetchSchedule = createAsyncThunk(
    `schedule/fetchEvents`,
     async ({token, date}, { dispatch }) => {
    // console.log("date in thunk ", date);
    
    const eventUrl = BaseUrl();
    const response = await axios.get(`${eventUrl}/user/get-mySchedules/${date}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (response.data.status === 401) {
        dispatch(logout());
        return Promise.reject(new Error('Unauthorized'));
    }
    // console.log("schedule data in thunk ", response.data);
    return response.data.data.list;
});

export const syncFetchSchedule = createAsyncThunk(`schedule/fetchScheduleSync`,

    async ({ token}, { dispatch }) => {
        // console.log("event id ", eventId);
        const eventDetailsUrl = BaseUrl();
        const response = await axios.get(`${eventDetailsUrl}/user/event/get-mySchedules-sync`, {
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

    export const scheduleSlice = createSlice({
        name: 'schedule',
        initialState: {
            schedules: [],
            schedulesDetails: null,
            status: 'idle',
            error: null
        },
        reducers: {
            addSchedule: (state, action) => {
                state.schedules.push(action.payload);
            }
        },
        extraReducers: (builder) => {
            builder
                .addCase(fetchSchedule.pending, (state) => {
                    state.status = 'loading';
                })
                .addCase(fetchSchedule.fulfilled, (state, action) => {
                    state.status = 'succeeded';
                    state.schedules = action.payload;
                })
                .addCase(fetchSchedule.rejected, (state, action) => {
                    state.status = 'failed';
                    state.error = action.error.message;
                })
    
    
                //  extra reducers for fetchScheduleDetails
                .addCase(syncFetchSchedule.pending, (state) => {
                    state.status = 'loading';
                })
                .addCase(syncFetchSchedule.fulfilled, (state, action) => {
                    state.status = 'succeeded';
                    state.schedulesDetails = action.payload;
                })
                .addCase(syncFetchSchedule.rejected, (state, action) => {
                    state.status = 'failed';
                    state.error = action.error.message;
                })
        }
    })


export const { addSchedule } = scheduleSlice.actions;

export default scheduleSlice.reducer;
