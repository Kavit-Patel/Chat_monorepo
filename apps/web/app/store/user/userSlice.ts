import { createSlice } from "@reduxjs/toolkit";
import { addNewUser, cookieAutoLogin, loginUser } from "./userApi";

export interface Iuser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  photo?: boolean;
}
interface initType {
  user: Iuser | null;
  createdStatus: "idle" | "pending" | "success" | "error";
  loginStatus: "idle" | "pending" | "success" | "error";
}
const initialState: initType = {
  user: null,
  createdStatus: "idle",
  loginStatus: "idle",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // setUser: (state, action) => {
    //   state.user = action.payload;
    // },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addNewUser.fulfilled, (state, action) => {
        state.user = action.payload.response;
        state.createdStatus = "success";
      })
      .addCase(addNewUser.rejected, (state) => {
        state.createdStatus = "error";
      })
      .addCase(addNewUser.pending, (state) => {
        state.createdStatus = "pending";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.response;
        state.loginStatus = "success";
      })
      .addCase(loginUser.rejected, (state) => {
        state.loginStatus = "error";
      })
      .addCase(loginUser.pending, (state) => {
        state.loginStatus = "pending";
      })
      .addCase(cookieAutoLogin.fulfilled, (state, action) => {
        state.user = action.payload.response;
        state.loginStatus = "success";
      })
      .addCase(cookieAutoLogin.rejected, (state) => {
        state.loginStatus = "error";
      })
      .addCase(cookieAutoLogin.pending, (state) => {
        state.loginStatus = "pending";
      });
  },
});
export default userSlice.reducer;
// export const {  } = userSlice.actions;
