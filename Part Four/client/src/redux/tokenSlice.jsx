import { createSlice } from '@reduxjs/toolkit';

const tokenSlice = createSlice({
    name: 'token',
    initialState: {
        token: null,
        user: null,
    },
    reducers: {
        setToken: (state, action) => {
            state.token = action.payload.token;  // שים לב שה-token סדרי
            state.user = action.payload.user;    // המשתמש גם כן סדרי
        },
        logOut: (state) => {
            state.token = null;
            state.user = null;
        }
    }
});

export const { setToken, logOut } = tokenSlice.actions;
export default tokenSlice.reducer;