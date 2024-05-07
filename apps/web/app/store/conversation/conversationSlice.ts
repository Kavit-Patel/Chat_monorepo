import { createSlice } from "@reduxjs/toolkit";
import { addNewConversation, getUserConversation } from "./conversationApi";
import { Iuser } from "../user/userSlice";
import { Iroom } from "../socket/socketSlice";

export interface Imessages {
  _id?: string;
  senderId: Iuser;
  receiverId: Iuser | Iroom;
  message: string;
  read: boolean;
  createdAt: string;
  // room?: string | null;
}
export interface Iprivate {
  myId: string;
  yourId: string;
}
export interface IinitialState {
  messages: Imessages[];
  privateMessagingPartner: Iprivate[];
  msgCreatedStatus: "idle" | "success" | "pending" | "error";
  msgFetchedStatus: "idle" | "success" | "pending" | "error";
}
const initialState: IinitialState = {
  messages: [],
  privateMessagingPartner: [],
  msgCreatedStatus: "idle",
  msgFetchedStatus: "idle",
};
const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    messaging: (state, action) => {
      console.log("msging", action.payload);
      state.messages = [...state.messages, action.payload];
    },
    setPrivateMessagingPartner: (state, action) => {
      state.privateMessagingPartner = action.payload;
    },
    updateMessagesReadState: (state, action) => {
      console.log("upmsging", action.payload);

      state.messages = action.payload;
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
        // console.log("int", action.payload);
        // state.messages = [...state.messages, action.payload.response];
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
export const {
  messaging,
  updateMessagesReadState,
  setPrivateMessagingPartner,
} = conversationSlice.actions;
export default conversationSlice.reducer;
