import { createSlice } from "@reduxjs/toolkit";
import { addNewUser, cookieAutoLogin, getAllUsers, loginUser } from "./userApi";

export interface Iuser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  photo: string;
}
export interface initType {
  user: Iuser | null;
  allUsers: Iuser[];
  createdStatus: "idle" | "pending" | "success" | "error";
  loginStatus: "idle" | "pending" | "success" | "error";
  fetchAllUsersStatus: "idle" | "pending" | "success" | "error";
}
const initialState: initType = {
  user: null,
  allUsers: [],
  createdStatus: "idle",
  loginStatus: "idle",
  fetchAllUsersStatus: "idle",
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
        if (action.payload.response) {
          state.user = action.payload.response;
          state.loginStatus = "success";
        }
      })
      .addCase(cookieAutoLogin.rejected, (state) => {
        state.loginStatus = "error";
      })
      .addCase(cookieAutoLogin.pending, (state) => {
        state.loginStatus = "pending";
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        console.log(action.payload.response);
        state.allUsers = action.payload.response;
        state.fetchAllUsersStatus = "success";
      })
      .addCase(getAllUsers.rejected, (state) => {
        state.fetchAllUsersStatus = "error";
      })
      .addCase(getAllUsers.pending, (state) => {
        state.fetchAllUsersStatus = "pending";
      });
  },
});
export default userSlice.reducer;
// export const {  } = userSlice.actions;
