import { NextRequest, NextResponse } from "next/server";
import { conversationModel } from "../../../../../models/conversationModel";
import { Iuser } from "../../../../store/user/userSlice";

export const GET = async (
  req: NextRequest,
  { params }: { params: { userId: string } }
) => {
  try {
    const { userId } = params;
    if (!userId)
      return NextResponse.json(
        { success: false, message: "Provide userId !" },
        { status: 403 }
      );
    const updateUserConversation = await conversationModel.updateMany(
      { receiverId: userId },
      { read: true }
    );
    const userConversation = await conversationModel
      .find({ $or: [{ senderId: userId }, { receiverId: userId }] })
      .populate("senderId")
      .populate("receiverId");
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
