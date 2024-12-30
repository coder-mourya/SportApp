import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BaseUrl } from './Api/bassUrl';
import { logout } from './authSlice';



export const fetchTrainings = createAsyncThunk(`training/fetchTraining`, async (token, { dispatch }) => {
    const trainingUrl = BaseUrl();
    const response = await axios.get(`${trainingUrl}/user/training/list`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (response.data.status === 401) {
        dispatch(logout());
        return Promise.reject(new Error('Unauthorized'));
    }
        // console.log("training data ", response.data.data.trainingData.trainingList);
        
    return response.data.data.trainingData.trainingList;
});

export const fetchTrainingDetails = createAsyncThunk(`training/fetchTrainingDetails`,
    async ({ trainingId, token}, { dispatch }) => {
        // console.log("redux called id", trainingId, "token", token);
        const trainingDetailsUrl = BaseUrl();
        const response = await axios.get(`${trainingDetailsUrl}/user/training/details`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                trainingId: trainingId
            }
        });

        if (response.data.status === 401) {
            dispatch(logout());
            return Promise.reject(new Error('Unauthorized'));
        }
        // console.log("training details in slice  ", response.data.data.trainingDetails);
        return response.data.data.trainingDetails;
    });

export const trainingSlice = createSlice({
    name: 'trainings',
    initialState: {
        trainings: [],
        trainingDetails: null,
        status: 'idle',
        error: null
    },
    reducers: {
        addEvent: (state, action) => {
            state.trainings.push(action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTrainings.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTrainings.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.events = action.payload;
            })
            .addCase(fetchTrainings.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })


            //  extra reducers for fetchEventsDetails
            .addCase(fetchTrainingDetails.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTrainingDetails.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.eventDetails = action.payload;
            })
            .addCase(fetchTrainingDetails.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
    }
})


export const { addEvent } = trainingSlice.actions;

export default trainingSlice.reducer;
