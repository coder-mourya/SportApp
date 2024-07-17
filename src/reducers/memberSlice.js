import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BaseUrl } from "./Api/bassUrl";


export const fetchMembers =  createAsyncThunk(`members/fetchMembers`, async (token) =>{
    // console.log("token" , token);
    const url = BaseUrl();

    const response = await axios.get(`${url}/user/get-all-members`, {
        headers: {
            Authorization : `Bearer ${token}`
        }
    });

    return response.data.data.membersData.memberList;
})


export const memberSlice = createSlice({
    name: 'members',
    initialState : {
        members : [],
        status : 'idle',
        error : null
    },

    reducers: {
        addMember: (state, action) => {
            // console.log("payload", action.payload);
            state.teams.push(action.payload);
            
        }
    },

    extraReducers: (builder) =>  {
        builder

          .addCase(fetchMembers.pending, (state) => {
            state.status = "loading" ;
          })

          .addCase(fetchMembers.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.members = action.payload
          })

          .addCase(fetchMembers.rejected, (state, action)  => {
            state.status = "failed";
            state.error = action.error.message
          })
    }
});

export const {Addmember} = memberSlice.actions;
export default memberSlice.reducer;