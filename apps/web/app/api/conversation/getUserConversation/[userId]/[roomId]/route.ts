import { NextRequest, NextResponse } from "next/server";
import { conversationModel } from "../../../../../../models/conversationModel";
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
    const possibleReceiverId = room ? [room._id, userId] : [userId];
    const updateUserConversation = await conversationModel.updateMany(
      { receiverId: userId },
      { read: true }
    );
    let userConversation;
    if (room) {
      const convIdArr = room.messages;
      userConversation = await Promise.all(
        convIdArr.map((convId) =>
          conversationModel
            .findById(convId)
            .populate("senderId")
            .populate("receiverId")
            .lean()
        )
      );
      //adding roomId as receiverId since populating receiverId will give null object
      userConversation = userConversation.map((conv) => {
        if (conv && !conv.receiverId) {
          return { ...conv, receiverId: room };
        }
        return conv;
      });
    } else {
      userConversation = await conversationModel
        .find({
          $or: [
            { senderId: userId },
            { receiverId: { $in: possibleReceiverId } },
          ],
        })
        .populate("senderId")
        .populate("receiverId");
    }

    return NextResponse.json(
      {
        success: true,
        message: "User Conversation fetched successfully !",
        response: userConversation,
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
