import { NextRequest, NextResponse } from "next/server";
import { conversationModel } from "../../../../../../models/conversationModel";
import { roomModel } from "../../../../../../models/roomModel";

export const GET = async (
  req: NextRequest,
  { params }: { params: { userId: string; roomId: string } }
) => {
  try {
    const { userId, roomId } = params;
    console.log(userId, roomId);
    if (!userId)
      return NextResponse.json(
        { success: false, message: "Provide userId !" },
        { status: 403 }
      );
    const room = await roomModel.findById(roomId);
    console.log("roomfetched");
    const possibleReceiverId = room ? [room._id, userId] : [userId];
    const updateUserConversation = await conversationModel.updateMany(
      { receiverId: userId },
      { read: true }
    );
    console.log("first");
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
      console.log("second");
      //adding roomId as receiverId since populating receiverId will give null object
      userConversation = userConversation.map((conv) => {
        if (conv && !conv.receiverId) {
          return { ...conv, receiverId: room };
        }
        return conv;
      });
    } else {
      console.log("third");
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

    // const receiverIdPromiseArr = userConversation
    //   .filter((el) => el.receiverId !== roomId)
    //   .map((ele) => ele.receiverId);
    // const receiverIdFulfiled = await Promise.all(
    //   receiverIdPromiseArr.map(async (receiver) =>
    //     userModel.findById(receiver).lean()
    //   )
    // );
    // console.log(receiverIdFulfiled);
    // const finalUserConversation = userConversation.map(async (element) => {
    //   if (element.receiverId.toString() === roomId) {
    //     return { ...element, receiverId: room };
    //   } else {
    //     const el = await userModel.findById(element.receiverId);
    //     return { ...element, receiverId: el };
    //   }
    //   return element;
    // });

    // const finalUserConversation = userConversation.map((el) => {
    //   // console.log("room", room);
    //   if (!el.receiverId) {
    //     if (room) {
    //       el.receiverId = room;
    //     }
    //   }
    //   return el;
    // });
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
