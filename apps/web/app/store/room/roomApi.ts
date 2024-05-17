import { createAsyncThunk } from "@reduxjs/toolkit";
import { Iroom } from "./roomSlice";
import { toast } from "react-toastify";

export interface RoomApiResponse {
  success: boolean;
  message: string;
  response: Iroom;
}
export interface FetchRoomsApiResponse {
  success: boolean;
  message: string;
  response: Iroom[];
}
export const addNewRoom = createAsyncThunk<
  RoomApiResponse,
  { userId: string; roomName: string },
  { rejectValue: string }
>("add/room", async ({ userId, roomName }, { rejectWithValue }) => {
  try {
    const req = await fetch(`/api/room/addNewRoom/${userId}`, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomName }),
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
      error instanceof Error ? error.message : "Room Creation Failed !";
    toast.error(errMessage);
    return rejectWithValue(errMessage);
  }
});

export const getUserRooms = createAsyncThunk<
  FetchRoomsApiResponse,
  string,
  { rejectValue: string }
>("fetch/rooms", async (userId, { rejectWithValue }) => {
  try {
    const req = await fetch(`/api/room/getUserRooms/${userId}`, {
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
      error instanceof Error ? error.message : "User's Room Fetching FAILED !";
    toast.error(errMessage);
    return rejectWithValue(errMessage);
  }
});

export const joinRoom = createAsyncThunk<
  RoomApiResponse,
  { roomId: string; userId: string },
  { rejectValue: string }
>("join/room", async ({ roomId, userId }, { rejectWithValue }) => {
  try {
    const req = await fetch(`/api/room/joinRoom/${roomId}/${userId}`, {
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
      error instanceof Error ? error.message : " Room Joining Failed !";
    toast.error(errMessage);
    return rejectWithValue(errMessage);
  }
});
