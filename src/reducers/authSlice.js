// features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const loadUserFromLocalStorage = () => {
  try {
    const serializedUser = localStorage.getItem('user');
    if (serializedUser === null) {
      return null;
    }
    return JSON.parse(serializedUser);
  } catch (e) {
    console.error("Could not load user from local storage", e);
    return null;
  }
};

const initialState = {
  user: loadUserFromLocalStorage(),
  isLoggedIn: !!loadUserFromLocalStorage(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn =  true;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      localStorage.removeItem('user');
    }
  }
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;
