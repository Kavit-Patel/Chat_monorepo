import { createSlice } from "@reduxjs/toolkit";

export interface Iuser {
  user: null | { name: string };
}
const initialState: Iuser = {
  user: { name: "kavit" },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
});
export default userSlice.reducer;
