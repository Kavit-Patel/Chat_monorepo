import { NextRequest, NextResponse } from "next/server";
import { conversationModel } from "../../../../../../models/conversationModel";
import { Iuser } from "../../../../../store/user/userSlice";
import { roomModel } from "../../../../../../models/roomModel";

export const GET = async (
  req: NextRequest,
  { params }: { params: { userId: string; roomId: string } }
) => {
  try {
    const { userId, roomId } = params;
    if (!userId)
      return NextResponse.json(
        { success: false, message: "Provide userId !" },
        { status: 403 }
      );
    const room = await roomModel.findById(roomId);
    const updateUserConversation = await conversationModel.updateMany(
      { receiverId: userId },
      { read: room ? false : true }
    );
    const userConversation = await conversationModel
      .find({ $or: [{ senderId: userId }, { receiverId: userId }] })
      .populate("senderId")
      .populate("receiverId");
    // const room = await roomModel.find(userId);
    const finalUserConversation = userConversation.map((el) => {
      console.log("room", room);
      if (!el.receiverId) {
        if (room) {
          el.receiverId = room;
        }
      }
      return el;
    });
    // console.log("convObj", finalUserConversation);
    // const userConversationWithRead = userConversation.map((msg) => {
    //   if (
    //     typeof msg.receiverId !== "string" &&
    //     msg.receiverId._id?.toString() === userId
    //   ) {
    //     return { ...msg, read: true };
    //   }
    //   return msg;
    // });
    // console.log("uc", userConversation);
    return NextResponse.json(
      {
        success: true,
        message: "User Conversation fetched successfully !",
        response: finalUserConversation,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Fetching User Messages Failed !" },
      { status: 500 }
    );
  }
};
