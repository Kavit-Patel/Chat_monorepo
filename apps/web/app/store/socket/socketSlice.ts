import { createSlice } from "@reduxjs/toolkit";
export interface Imessages {
  sender: string;
  message: string;
  receiver?: string;
  room?: string | null;
}
export interface Iroom {
  roomId: string;
  roomCreator: string;
  messages?: Imessages[]; //thinking optional
}
export interface Ionline {
  socketId: string;
  user: string;
}

export interface Isocket {
  onlineUsers: Ionline[];
  messages: Imessages[];
  rooms: Iroom[];
}
const initialState: Isocket = {
  onlineUsers: [],
  messages: [],
  rooms: [],
};
const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    messagingToAll: (state, action) => {
      state.messages = [...state.messages, action.payload];
    },
    creatRoom: (state, action) => {
      state.rooms = action.payload;
    },
  },
});
export default socketSlice.reducer;
export const { setOnlineUsers, messagingToAll, creatRoom } =
  socketSlice.actions;
