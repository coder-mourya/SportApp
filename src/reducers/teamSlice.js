import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import { BaseUrl } from './Api/bassUrl';
import { logout } from './authSlice';

export const fetchTeams = createAsyncThunk(`teams/fetchTeams`, async (token, {dispatch}) => {
    const teamUrl = BaseUrl();

    const response = await axios.get(`${teamUrl}/user/myteams/list`, {
        headers : {
            Authorization : `Bearer ${token}`
        }
    });

    if (response.data.status === 401) {
        dispatch(logout());
        return Promise.reject(new Error('Unauthorized'));
    }


    return response.data.data.teamData.teamList;

})

export const fetchTeamDetails = createAsyncThunk(
    'teams/fetchTeamDetails',
    async ({ teamId, token , dispatch }) => {
        // console.log("data is fechted" , teamId, token);
        const teamDetailsUrl = BaseUrl();
        const response = await axios.get(`${teamDetailsUrl}/user/team/details/${teamId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        if (response.data.status === 401) {
            dispatch(logout());
            return Promise.reject(new Error('Unauthorized'));
        }

        return response.data.data.teamDetails;
    }
);




export const teamsSlice = createSlice({
    name: 'teams',
    initialState: {
        teams: [],
        teamDetails: null,
        status: 'idle',
        error: null
    },
    reducers: {
        addTeam: (state, action) => {
            // console.log("payload", action.payload);
            state.teams.push(action.payload);
            
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTeams.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTeams.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.teams = action.payload;
            })
            .addCase(fetchTeams.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })


            //  extra reducers for fetchTeamDetails
            .addCase(fetchTeamDetails.pending, (state) => {
               
                state.status = 'loading';
            })
            .addCase(fetchTeamDetails.fulfilled, (state, action) => {
                
                state.status = 'succeeded';
                state.teamDetails = action.payload;
            })
            .addCase(fetchTeamDetails.rejected, (state, action) => {
                
                state.status = 'failed';
                state.error = action.error.message;
            });
    },

});

export const { addTeam } = teamsSlice.actions;

export default teamsSlice.reducer;
