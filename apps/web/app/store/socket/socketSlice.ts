import { createSlice } from "@reduxjs/toolkit";

export interface Iroom {
  roomId: string;
  roomCreator: string;
}
export interface Ionline {
  socketId: string;
  user: string;
}

export interface Isocket {
  onlineUsers: Ionline[];
  rooms: Iroom[];
}
const initialState: Isocket = {
  onlineUsers: [],
  rooms: [],
};
const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },

    creatRoom: (state, action) => {
      state.rooms = action.payload;
    },
  },
});
export default socketSlice.reducer;
export const { setOnlineUsers, creatRoom } = socketSlice.actions;
