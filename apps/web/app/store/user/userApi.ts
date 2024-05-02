import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { Iuser } from "./userSlice";

interface ApiResponse {
  success: boolean;
  message: string;
  response: Iuser;
}
interface ApiResponseFetchAllUsers {
  success: boolean;
  message: string;
  response: Iuser[];
}

interface IloginDataObj {
  email: string;
  password: string;
}
export const addNewUser = createAsyncThunk<
  ApiResponse,
  FormData,
  { rejectValue: string }
>("register/user", async (formData: FormData, { rejectWithValue }) => {
  try {
    const req = await fetch("/api/user/addNewUser", {
      credentials: "include",
      method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      body: formData,
    });
    const data = await req.json();
    if (data.success) {
      toast.success(data.message);
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    const errMessage =
      error instanceof Error ? error.message : "User Registration Failed !";
    console.log(errMessage);
    toast.error(errMessage);
    rejectWithValue(errMessage);
  }
});

export const loginUser = createAsyncThunk<
  ApiResponse,
  IloginDataObj,
  { rejectValue: string }
>("login/user", async (dataObj, { rejectWithValue }) => {
  try {
    const req = await fetch("/api/user/loginUser", {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataObj),
    });
    const data = await req.json();
    if (data.success) {
      toast.success(data.message);
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    const errMessage =
      error instanceof Error ? error.message : "User Registration Failed !";
    console.log(errMessage);
    toast.error(errMessage);
    rejectWithValue(errMessage);
  }
});
export const cookieAutoLogin = createAsyncThunk<
  ApiResponse,
  undefined,
  { rejectValue: string }
>("auto-login/user", async (_, { rejectWithValue }) => {
  try {
    const req = await fetch("/api/user/cookieAutoLogin", {
      credentials: "include",
    });
    const data = await req.json();
    if (data.success) {
      toast.success(data.message);
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    const errMessage =
      error instanceof Error ? error.message : "User Registration Failed !";
    console.log(errMessage);
    toast.error(errMessage);
    rejectWithValue(errMessage);
  }
});

export const getAllUsers = createAsyncThunk<
  ApiResponseFetchAllUsers,
  string,
  { rejectValue: string }
>("fetch/users", async (userId, { rejectWithValue }) => {
  try {
    const req = await fetch(`/api/user/getAllUsers/${userId}`, {
      credentials: "include",
    });
    const data = await req.json();
    if (data.success) {
      toast.success(data.message);
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    const errMessage =
      error instanceof Error ? error.message : "Fetching Users Failed !";
    toast.error(errMessage);
    return rejectWithValue(errMessage);
  }
});
