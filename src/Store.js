// app/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authSlice';
import teamReducer from './reducers/teamSlice';
import memberReducer from "./reducers/memberSlice";
import eventReducer from "./reducers/eventSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    teams: teamReducer,
    members : memberReducer ,
    events : eventReducer 
  },
});

export default store;
