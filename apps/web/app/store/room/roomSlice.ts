import { createSlice } from "@reduxjs/toolkit";
import { addNewRoom, getUserRooms, joinRoom } from "./roomApi";
import { Imessages } from "../conversation/conversationSlice";
import { Iuser } from "../user/userSlice";

export interface Iroom {
  _id?: string;
  messages: Imessages[];
  roomUsers: Iuser[];
  roomName: string;
  creator: string;
}
export interface IinitialState {
  rooms: Iroom[];
  roomCreatedStatus: "idle" | "success" | "pending" | "error";
  roomsFetchedStatus: "idle" | "success" | "pending" | "error";
  roomsJoinStatus: "idle" | "success" | "pending" | "error";
}
const initialState: IinitialState = {
  rooms: [],
  roomCreatedStatus: "idle",
  roomsFetchedStatus: "idle",
  roomsJoinStatus: "idle",
};
const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addNewRoom.fulfilled, (state, action) => {
        state.rooms = [...state.rooms, action.payload.response];
        state.roomCreatedStatus = "success";
      })
      .addCase(addNewRoom.rejected, (state) => {
        state.roomCreatedStatus = "error";
      })
      .addCase(addNewRoom.pending, (state) => {
        state.roomCreatedStatus = "pending";
      })
      .addCase(getUserRooms.fulfilled, (state, action) => {
        state.rooms = action.payload.response;
        state.roomsFetchedStatus = "success";
      })
      .addCase(getUserRooms.rejected, (state) => {
        state.roomsFetchedStatus = "error";
      })
      .addCase(getUserRooms.pending, (state) => {
        state.roomsFetchedStatus = "pending";
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
        const matchedIndex = state.rooms.findIndex(
          (idx) => idx._id === action.payload.response._id
        );
        if (matchedIndex !== -1) {
          state.roomsJoinStatus = "success";
          state.rooms.splice(matchedIndex, 1, action.payload.response);
        }
      })
      .addCase(joinRoom.rejected, (state) => {
        state.roomsJoinStatus = "error";
      })
      .addCase(joinRoom.pending, (state) => {
        state.roomsJoinStatus = "pending";
      });
  },
});
export default roomSlice.reducer;
