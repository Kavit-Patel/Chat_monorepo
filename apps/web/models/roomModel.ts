import mongoose, { Model } from "mongoose";

export interface Iroom {
  messages: mongoose.Types.ObjectId;
  roomName: string;
  creator: mongoose.Types.ObjectId;
}
const roomSchema = new mongoose.Schema(
  {
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Conversations" }],
    roomName: { type: String, required: true },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
  },
  { timestamps: true }
);
const creatRoomModel = (): Model<Iroom> => {
  if (mongoose.models.Rooms) {
    return mongoose.model<Iroom>("Rooms");
  } else {
    return mongoose.model<Iroom>("Rooms", roomSchema);
  }
};
export const roomModel = creatRoomModel();
