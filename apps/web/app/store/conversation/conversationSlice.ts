import { createSlice } from "@reduxjs/toolkit";
import { addNewConversation, getUserConversation } from "./conversationApi";
import { Iuser } from "../user/userSlice";

export interface Imessages {
  _id?: string;
  senderId: Iuser;
  message: string;
  receiverId: Iuser;
  room?: string | null;
}
export interface IinitialState {
  messages: Imessages[];
  msgCreatedStatus: "idle" | "success" | "pending" | "error";
  msgFetchedStatus: "idle" | "success" | "pending" | "error";
}
const initialState: IinitialState = {
  messages: [],
  msgCreatedStatus: "idle",
  msgFetchedStatus: "idle",
};
const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    messaging: (state, action) => {
      state.messages = [...state.messages, action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserConversation.fulfilled, (state, action) => {
        state.messages = action.payload.response;
        state.msgFetchedStatus = "success";
      })
      .addCase(getUserConversation.rejected, (state) => {
        state.msgFetchedStatus = "error";
      })
      .addCase(getUserConversation.pending, (state) => {
        state.msgFetchedStatus = "pending";
      })
      .addCase(addNewConversation.fulfilled, (state, action) => {
        console.log("int", action.payload);
        state.messages = [...state.messages, action.payload.response];
        state.msgCreatedStatus = "success";
      })
      .addCase(addNewConversation.rejected, (state) => {
        state.msgCreatedStatus = "error";
      })
      .addCase(addNewConversation.pending, (state) => {
        state.msgCreatedStatus = "pending";
      });
  },
});
export const { messaging } = conversationSlice.actions;
export default conversationSlice.reducer;
