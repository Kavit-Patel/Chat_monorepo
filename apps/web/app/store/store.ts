import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice";
import socketReducer from "./socket/socketSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    socket: socketReducer,
  },
});
export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
