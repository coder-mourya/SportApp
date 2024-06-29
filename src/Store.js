// app/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authSlice';
import teamReducer from './reducers/teamSlice';
import memberReducer from "./reducers/memberSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    teams: teamReducer,
    members : memberReducer  
  },
});

export default store;
