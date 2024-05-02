import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { Imessages } from "./conversationSlice";

interface ApiResponse {
  success: boolean;
  message: string;
  response: Imessages;
}
interface ApiResponseUserConversation {
  success: boolean;
  message: string;
  response: Imessages[];
}

export const addNewConversation = createAsyncThunk<
  ApiResponse,
  { senderId: string; receiverId: string; message: string },
  { rejectValue: string }
>("add/conversation", async (dataObj, { rejectWithValue }) => {
  try {
    console.log("do", dataObj);
    const req = await fetch("/api/conversation/addNewConversation", {
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
      error instanceof Error ? error.message : "Adding Conversation Failed !";
    toast.error(errMessage);
    return rejectWithValue(errMessage);
  }
});

export const getUserConversation = createAsyncThunk<
  ApiResponseUserConversation,
  string,
  { rejectValue: string }
>("fetch/conversation", async (userId, { rejectWithValue }) => {
  try {
    const req = await fetch(`/api/conversation/getUserConversation/${userId}`);
    const data = await req.json();
    if (data.success) {
      toast.success(data.message);
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    const errMessage =
      error instanceof Error ? error.message : "Fetching Conversation Failed !";
    toast.error(errMessage);
    return rejectWithValue(errMessage);
  }
});
