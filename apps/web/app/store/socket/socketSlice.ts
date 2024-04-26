import { createSlice } from "@reduxjs/toolkit";
export interface Imessages {
  socketId: string;
  message: string;
}
export interface Iroom {
  roomId: string;
  roomCreator: string;
  messages?: Imessages[];
}

export interface IsocketEvents {
  messages: Imessages[];
  rooms: Iroom[];
}
const initialState: IsocketEvents = {
  messages: [],
  rooms: [],
};
const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    messagingToAll: (state, action) => {
      state.messages = [...state.messages, action.payload];
    },
    creatRoom: (state, action) => {
      state.rooms = action.payload;
      console.log(state.rooms);
    },
  },
});
export default socketSlice.reducer;
export const { messagingToAll, creatRoom } = socketSlice.actions;
