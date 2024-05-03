import { Iuser } from "../app/store/user/userSlice";

export const getUserFromId = (id: string, arr: Iuser[]) => {
  const res = arr.find((user) => user._id === id);
  console.log(id, arr, "res", res);
  return res || id;
};
