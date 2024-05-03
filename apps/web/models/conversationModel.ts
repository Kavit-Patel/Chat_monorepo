import mongoose, { Model } from "mongoose";
import { userType } from "./userModel";

export interface Iconversation {
  id?: string;
  senderId: string | userType;
  receiverId: string | userType;
  message: string;
  read: boolean;
}

const conversationSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const createConversationModel = (): Model<Iconversation> => {
  if (mongoose.models.Conversations) {
    return mongoose.model<Iconversation>("Conversations");
  } else {
    return mongoose.model<Iconversation>("Conversations", conversationSchema);
  }
};
export const conversationModel = createConversationModel();
