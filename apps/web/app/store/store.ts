import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice";
import socketReducer from "./socket/socketSlice";
import conversationReducer from "./conversation/conversationSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    socket: socketReducer,
    conversation: conversationReducer,
  },
});
export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
